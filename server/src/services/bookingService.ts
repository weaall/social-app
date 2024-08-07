import { FieldPacket, ResultSetHeader } from "mysql2";
import pool from "../config/db";
import CustomError from "../utils/customError";
import { BookingProps, BookingRefProps } from "../interface/interfaces";
import dayjs from "dayjs";
import { BookingRefRows, BookingRows } from "../interface/mysql.interface";

const bookingService = {
    async addBookingRef(user_id: string, { booking_id, room_id, total_price, check_in, check_out }: BookingRefProps) {
        const connection = await pool.getConnection();

        const addBookingRefSql = `INSERT INTO booking_ref (booking_id, user_id, room_id, total_price, check_in, check_out, date) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const addBookingRefValue = [booking_id, user_id, room_id, total_price, check_in, check_out, dayjs().format("YYYY-MM-DDTHH:mm:ss")];

        try {
            const [addBookingRefResult, field]: [ResultSetHeader, FieldPacket[]] = await connection.execute(addBookingRefSql, addBookingRefValue);

            return addBookingRefResult;
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    },

    async deleteBookingRef( booking_id: string) {
        const connection = await pool.getConnection();

        const removeBookingRefSql = `DELETE FROM booking_ref WHERE booking_id = ?`;
        const removeBookingRefValue = [booking_id];

        try {
            const [removeBookingRefResult, field]: [ResultSetHeader, FieldPacket[]] = await connection.execute(removeBookingRefSql, removeBookingRefValue);

            return;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    async rollbackBookingRef(user_id: string, booking_id: string) {
        const connection = await pool.getConnection();

        const removeBookingRefSql = `DELETE FROM booking_ref WHERE booking_id = ? AND user_id = ?`;
        const removeBookingRefValue = [booking_id, user_id];

        try {
            const [removeBookingRefResult, fields]: [ResultSetHeader, FieldPacket[]] = await connection.execute(removeBookingRefSql, removeBookingRefValue);

            return;
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    },

    async getBookingRef(booking_id: string) {
        const connection = await pool.getConnection();

        const getBookingRefSql = `SELECT * FROM booking_ref WHERE booking_id = ?`;
        const getBookingRefValue = [booking_id];

        try {
            const [rows, field]: [BookingRefRows[], FieldPacket[]] = await connection.execute(getBookingRefSql, getBookingRefValue);

            return rows;
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    },

    async getBookingById(user_id: string, booking_id: string) {
        const connection = await pool.getConnection();

        const getBookingSql = `SELECT * FROM booking WHERE booking_id = ? and user_id = ?`;
        const getBookingValue = [booking_id, user_id];

        try {
            const [rows, field]: [BookingRows[], FieldPacket[]] = await connection.execute(getBookingSql, getBookingValue);

            return rows;
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    },

    async getBookingByUserId(user_id: string) {
        const connection = await pool.getConnection();

        const today = dayjs().format('YYYY-MM-DD');

        const getBookingSql = `SELECT * FROM booking WHERE user_id = ? AND check_out >= ?`;
        const getBookingValue = [user_id, today];

        try {
            const [rows, field]: [BookingRows[], FieldPacket[]] = await connection.execute(getBookingSql, getBookingValue);

            return rows;
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    },

    async getReviewByUserId(user_id: string) {
        const connection = await pool.getConnection();

        const today = dayjs().format('YYYY-MM-DD');

        const getBookingSql = `SELECT * FROM booking WHERE user_id = ? AND check_out < ? ORDER BY check_in DESC;`;
        const getBookingValue = [user_id, today];

        try {
            const [rows, field]: [BookingRows[], FieldPacket[]] = await connection.execute(getBookingSql, getBookingValue);

            return rows;
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    },

    async addBooking(user_id: string, { booking_id, hotel_id, room_id, total_price, check_in, check_out, name, mobile, email }: BookingProps) {
        const connection = await pool.getConnection();

        const addBookingSql = `INSERT INTO booking (user_id, booking_id, hotel_id, room_id, total_price, check_in, check_out, name, mobile, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const addBookingValue = [user_id, booking_id, hotel_id, room_id, total_price, check_in, check_out, name, mobile, email];

        try {
            await connection.beginTransaction();

            let currentDate = dayjs(check_in);
            const endDate = dayjs(check_out);

            try {
                while (currentDate.isBefore(endDate)) {
                    const addRoomCurrentSql = `UPDATE room_date SET room_current = room_current + 1 WHERE room_id = ? AND date = ?`;
                    const addRoomCurrentValue = [room_id, currentDate.format("YYYY-MM-DD")];
                    await connection.execute(addRoomCurrentSql, addRoomCurrentValue);
                    currentDate = currentDate.add(1, "day");
                }
            } catch (error) {
                throw new CustomError("NOT AVAILABLE", 400);
            }

            const [rows, fields]: [ResultSetHeader[], FieldPacket[]] = await connection.execute(addBookingSql, addBookingValue);

            await connection.commit();

            return rows;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },
};

export default bookingService;
