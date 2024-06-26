import { Response, Request, query } from "express";
import { JWTCheck, RoomPriceRows } from "../interface/interfaces";
import bookingService from "../services/bookingService";
import roomService from "../services/roomService";
import { getRedis, setRedis, setRedis1D } from "../utils/redisUtils";
import dayjs from "dayjs";
import CustomError from "../utils/customError";
import msgService from "../services/msgService";
const got = require("got");

const filterByDate = (priceData: RoomPriceRows[], checkIn: string, checkOut: string, totalPrice: number) => {
    const filteredData = priceData.filter((price) => {
        const dateInRange = dayjs(price.date).isAfter(dayjs(checkIn).subtract(1, "day")) && dayjs(price.date).isBefore(checkOut, "day");
        const isAvailable = price.room_limit > price.room_current;
        return dateInRange && isAvailable;
    });

    const totalFilteredPrice = filteredData.reduce((sum, price) => sum + price.price, 0);
    const isTotalPriceMatch = totalFilteredPrice === totalPrice;

    const isAllFilteredDataIncluded = filteredData.every((item) => priceData.includes(item));

    return isTotalPriceMatch && isAllFilteredDataIncluded;
};

const bookingController = {
    async addBookingRef(req: JWTCheck, res: Response) {
        const roomId: string = req.body.room_id;
        const totalPrice: number = req.body.total_price;
        const checkIn = dayjs(req.body.check_in as string).format("YYYY-MM-DD");
        const checkOut = dayjs(req.body.check_out as string).format("YYYY-MM-DD");
        try {
            const roomData = await roomService.getPriceByRoomId(roomId);

            if (!filterByDate(roomData, checkIn, checkOut, totalPrice)) {
                throw new CustomError("NOT AVAILABLE", 400);
            }

            const data = await bookingService.addBookingRef(req.user.id, req.body);

            res.status(200).json({
                error: null,
                data: data,
            });
        } catch (error) {
            throw error;
        }
    },

    async removeBookingRef(req: Request, res: Response) {
        let bookingRefProps = req.query.booking_id as string;

        if (bookingRefProps === undefined) {
            bookingRefProps = req.body.booking_id;
        }

        console.log(bookingRefProps);

        try {
            const data = await bookingService.removeBookingRef(bookingRefProps);

            res.status(200).json({
                error: null,
                data: data,
            });
        } catch (error) {
            throw error;
        }
    },

    async getBookingById(req: JWTCheck, res: Response) {
        try {
            const key: string = `/booking/${req.params.id}`;
            const redisData = JSON.parse(await getRedis(key));

            if (redisData === null) {
                const data = await bookingService.getBookingById(req.user.id, req.params.id);

                setRedis(key, data);

                res.status(200).json({
                    error: null,
                    data: data,
                });
            } else {
                res.status(200).json({
                    error: null,
                    data: redisData,
                });
            }
        } catch (error) {
            const data = await bookingService.getBookingById(req.user.id, req.params.id);

            res.status(200).json({
                error: null,
                data: data,
            });
        }
    },

    async getBookingByUserId(req: JWTCheck, res: Response) {
        try {
            const key: string = `/booking/user/${req.user.id}`;
            const redisData = JSON.parse(await getRedis(key));

            if (redisData === null) {
                const data = await bookingService.getBookingByUserId(req.user.id);

                setRedis1D(key, data);

                res.status(200).json({
                    error: null,
                    data: data,
                });
            } else {
                res.status(200).json({
                    error: null,
                    data: redisData,
                });
            }
        } catch (error) {
            const data = await bookingService.getBookingByUserId(req.user.id);

            res.status(200).json({
                error: null,
                data: data,
            });
        }
    },

    async getReviewByUserId(req: JWTCheck, res: Response) {
        try {
            const key: string = `/review/user/${req.user.id}`;
            const redisData = JSON.parse(await getRedis(key));

            if (redisData === null) {
                const data = await bookingService.getReviewByUserId(req.user.id);

                setRedis1D(key, data);

                res.status(200).json({
                    error: null,
                    data: data,
                });
            } else {
                res.status(200).json({
                    error: null,
                    data: redisData,
                });
            }
        } catch (error) {
            const data = await bookingService.getReviewByUserId(req.user.id);

            res.status(200).json({
                error: null,
                data: data,
            });
        }
    },

    async confirm(req: Request, res: Response) {
        const { hotel_id, name, email, phone_num, paymentType, orderId, paymentKey, amount } = req.query;

        const widgetSecretKey = "test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6";
        const encryptedSecretKey = "Basic " + Buffer.from(widgetSecretKey + ":").toString("base64");

        try {
            const bookingRefData = await bookingService.getBookingRef(orderId as string);

            const parsedAmount = Number(amount);
            const parsedOrderId = orderId as string;

            if (bookingRefData[0].total_price === parsedAmount && bookingRefData[0].booking_id === parsedOrderId) {

                try {
                    const response = await got.post("https://api.tosspayments.com/v1/payments/confirm", {
                        headers: {
                            Authorization: encryptedSecretKey,
                            "Content-Type": "application/json",
                        },
                        json: {
                            orderId: orderId,
                            amount: amount,
                            paymentKey: paymentKey,
                        },
                        responseType: "json",
                    });

                    await bookingService.addBooking(bookingRefData[0].user_id, {
                        booking_id: parsedOrderId,
                        hotel_id: hotel_id as string,
                        room_id: bookingRefData[0].room_id,
                        total_price: parsedAmount,
                        check_in: bookingRefData[0].check_in,
                        check_out: bookingRefData[0].check_out,
                        name: name as string,
                        phone_num: phone_num as string,
                        email: email as string,
                    });

                    const successMsg = `예약이 성공적으로 완료되었습니다.\n\n
                            예약 번호: ${orderId}\n
                            호텔 이름: ${hotel_id}\n
                            체크인 날짜: ${bookingRefData[0].check_in}\n
                            체크아웃 날짜: ${bookingRefData[0].check_out}\n
                            총 금액: ${parsedAmount}\n
                            예약자 이름: ${name}\n
                            예약자 연락처: ${phone_num}\n
                            예약자 이메일: ${email}`;

                    await msgService.addMsgFromHotel(bookingRefData[0].user_id, hotel_id as string, successMsg);

                    // 결제 승인 요청이 성공적으로 처리된 경우에만 이동합니다.
                    res.redirect(`http://localhost:3000/success/${orderId}`);
                } catch (paymentError) {
                    // 결제 승인 요청이 실패한 경우 롤백
                    await bookingService.rollbackBookingRef(bookingRefData[0].user_id, parsedOrderId);
                    throw paymentError;
                }
            } else {
                throw new CustomError("UNAUTHORIZED", 401);
            }
        } catch (error) {
            // 오류가 발생한 경우에는 실패 페이지로 이동합니다.
            res.redirect("http://localhost:3000/fail");
        }
    },
};

export default bookingController;
