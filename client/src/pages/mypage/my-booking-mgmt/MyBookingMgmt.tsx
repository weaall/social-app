import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";

import { ModalPortal } from "../../../hook/modal/ModalPortal";
import KakaoMapModal from "../../../hook/modal/kakao-map/KakaMap.modal";
import LoadingModal from "../../../hook/modal/loading/Loading.modal";

import { sendJWT } from "../../../utils/jwtUtils";
import { axiosInstance, handleAxiosError } from "../../../utils/axios.utils";
import ImgLoader from "../../../utils/imgLoader";
import { getThumbnailCFUrl } from "../../../utils/s3UrlToCFD.utils";
import { facilItems, servItems } from "../../../data/hotelData";

import * as tw from "./MyBookingMgmt.styles";

interface BookingData {
    booking_id: string;
    hotel_id: number;
    room_id: number;
    total_price: number;
    check_in: string;
    check_out: string;
    name: string;
    mobile: string;
    emial: string;
}

export function MyBookingMgmtPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const openLoadingModal = () => {
        setLoading(true);
    };
    const closeLoadingModal = () => {
        setLoading(false);
    };

    const { id } = useParams();

    const [isKakaoMapModalOpen, setIsKakaoMapModalOpen] = useState(false);

    const openKakaoMapModal = () => {
        setIsKakaoMapModalOpen(true);
    };

    const closeKakaoMapModal = () => {
        setIsKakaoMapModalOpen(false);
    };

    const [bookingData, setBookingData] = useState<BookingData>();

    const [hotelData, setHotelData] = useState({
        id: "",
        name: "",
        address: "",
        address_detail: "",
        postcode: "",
        description: "",
        check_in: 0,
        check_out: 0,

        wifi: 0,
        always_check_in: 0,
        breakfast: 0,
        barbecue: 0,

        carpark: 0,
        restaurnat: 0,
        cafe: 0,
        swimming_pool: 0,
        spa: 0,
        fitness: 0,
        convenience_store: 0,
    });

    const [roomData, setRoomData] = useState({
        id: 0,
        name: "",
        num: 0,
        view_type: "",
        bed_type: "",
        discount: 0,
    });

    const fetchHotel = useCallback(
        async (hotelId: number) => {
            try {
                const hotelResponse = await axiosInstance.get("/hotel/" + hotelId);
                const hotelData = hotelResponse.data.data[0];

                setHotelData(hotelData);
            } catch (error) {
                handleAxiosError(error, navigate);
            }
        },
        [navigate],
    );

    const fetchRoom = useCallback(
        async (roomId: number) => {
            try {
                const roomResponse = await axiosInstance.get("/room/" + roomId);
                const room = roomResponse.data.data[0];

                setRoomData(room);
            } catch (error) {
                handleAxiosError(error, navigate);
            }
        },
        [navigate],
    );

    const fetchBooking = useCallback(async () => {
        openLoadingModal();
        try {
            const config = await sendJWT({
                method: "GET",
                url: "/booking/" + id,
            });

            const response = await axiosInstance.request(config);
            const bookingData = response.data.data[0];
            setBookingData(bookingData);
            fetchHotel(bookingData.hotel_id);
            fetchRoom(bookingData.room_id);
        } catch (error) {
            handleAxiosError(error, navigate);
        } finally {
            closeLoadingModal();
        }
    }, [navigate, id, fetchHotel, fetchRoom]);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchBooking();
    }, [fetchBooking]);

    return (
        <tw.Container>
            <tw.MobileWrap>
                <tw.TitleWrap>
                    <tw.Title>예약관리</tw.Title>
                </tw.TitleWrap>
                <tw.ContentsWrap>
                    <tw.OuterWrap>
                        <tw.Label>호텔정보</tw.Label>
                        <tw.RoomWrap>
                            <tw.ContentsFlex>
                                <tw.Pic>
                                    <ImgLoader
                                        imageUrl={getThumbnailCFUrl(`/hotel_img/${hotelData.id}`)}
                                        altText=""
                                        rounded="l-xl mobile:rounded-none mobile:rounded-t-xl"
                                    />
                                </tw.Pic>
                                <tw.OuterInfoWrap>
                                    <tw.RoomInfo>
                                        <tw.InfoWrap>
                                            <tw.HotelTitle>{hotelData.name}</tw.HotelTitle>
                                            <tw.AddressWrap>
                                                <tw.AddressSVG alt="" src={require("../../../assets/svg/location_icon.svg").default} />
                                                <tw.HotelAddress onClick={openKakaoMapModal}>
                                                    {hotelData.address} {hotelData.address_detail}, {hotelData.postcode}
                                                </tw.HotelAddress>
                                            </tw.AddressWrap>
                                        </tw.InfoWrap>
                                    </tw.RoomInfo>
                                </tw.OuterInfoWrap>
                            </tw.ContentsFlex>
                        </tw.RoomWrap>
                        <tw.RoomWrap>
                            <tw.ContentsFlex>
                                <tw.Pic>
                                    <ImgLoader
                                        imageUrl={getThumbnailCFUrl(`/room_img/${bookingData?.hotel_id}/${bookingData?.room_id}`)}
                                        altText=""
                                        rounded="l-xl mobile:rounded-none mobile:rounded-t-xl"
                                    />
                                </tw.Pic>
                                <tw.OuterInfoWrap>
                                    <tw.RoomInfo>
                                        <tw.InfoWrap>
                                            <tw.RoomName>{roomData.name}</tw.RoomName>
                                            <tw.RoomDetailWrap>
                                                <tw.RoomDetail>
                                                    <tw.RoomSvg alt="" src={require("../../../assets/svg/view_icon.svg").default} />
                                                    <tw.RoomText>{roomData.view_type}</tw.RoomText>
                                                </tw.RoomDetail>
                                                <tw.RoomDetail>
                                                    <tw.RoomSvg alt="" src={require("../../../assets/svg/room.svg").default} />
                                                    <tw.RoomText>{roomData.bed_type}</tw.RoomText>
                                                </tw.RoomDetail>
                                                <tw.RoomDetail>
                                                    <tw.RoomSvg alt="" src={require("../../../assets/svg/person_icon.svg").default} />
                                                    <tw.RoomText>{roomData.num}인</tw.RoomText>
                                                </tw.RoomDetail>
                                            </tw.RoomDetailWrap>
                                        </tw.InfoWrap>
                                    </tw.RoomInfo>
                                </tw.OuterInfoWrap>
                            </tw.ContentsFlex>
                        </tw.RoomWrap>
                        <tw.CheckWrap>
                            <tw.CheckInWrap>
                                <tw.CheckLabel>체크인</tw.CheckLabel>
                                <tw.CheckText>{dayjs(bookingData?.check_in).format("YYYY. MM. DD (dddd)")}</tw.CheckText>
                                <tw.CheckText>({hotelData.check_in}:00 시 이후)</tw.CheckText>
                            </tw.CheckInWrap>
                            <tw.CheckOutWrap>
                                <tw.CheckLabel>체크아웃</tw.CheckLabel>
                                <tw.CheckText>{dayjs(bookingData?.check_out).format("YYYY. MM. DD (dddd)")}</tw.CheckText>
                                <tw.CheckText>({hotelData.check_out}:00 시 이전)</tw.CheckText>
                            </tw.CheckOutWrap>
                        </tw.CheckWrap>
                    </tw.OuterWrap>
                    <tw.HotelServWrap>
                        <tw.Label>서비스 / 편의시설</tw.Label>
                        <tw.HotelServ>
                            {servItems.map((item) =>
                                (hotelData as any)[item.comp] === 1 ? (
                                    <tw.HotelTextWrap key={item.comp}>
                                        <tw.HotelSvg alt="" src={require("../../../assets/svg/check_icon.svg").default} />
                                        <tw.HotelText key={item.comp}>{item.label}</tw.HotelText>
                                    </tw.HotelTextWrap>
                                ) : null,
                            )}
                            {facilItems.map((item) =>
                                (hotelData as any)[item.comp] === 1 ? (
                                    <tw.HotelTextWrap key={item.comp}>
                                        <tw.HotelSvg alt="" src={require("../../../assets/svg/check_icon.svg").default} />
                                        <tw.HotelText key={item.comp}>{item.label}</tw.HotelText>
                                    </tw.HotelTextWrap>
                                ) : null,
                            )}
                        </tw.HotelServ>
                    </tw.HotelServWrap>
                    <tw.DetailWrap>
                        <tw.Label>예약 세부 사항</tw.Label>
                        <tw.DetailRow>
                            <tw.DetailLabelWrap>
                                <tw.DetailLabel>객실 수 및 숙박 수</tw.DetailLabel>
                            </tw.DetailLabelWrap>
                            <tw.DetailTextWrap>
                                <tw.DetailText>객실 1개 / {dayjs(bookingData?.check_out).diff(dayjs(bookingData?.check_in), "day")}박</tw.DetailText>
                            </tw.DetailTextWrap>
                        </tw.DetailRow>
                        <tw.DetailRow>
                            <tw.DetailLabelWrap>
                                <tw.DetailLabel>객실종류</tw.DetailLabel>
                            </tw.DetailLabelWrap>
                            <tw.DetailTextWrap>
                                <tw.DetailText>
                                    {roomData.name}({roomData.view_type}) / {roomData.bed_type}
                                </tw.DetailText>
                            </tw.DetailTextWrap>
                        </tw.DetailRow>
                        <tw.DetailRow>
                            <tw.DetailLabelWrap>
                                <tw.DetailLabel>대표 투숙객</tw.DetailLabel>
                            </tw.DetailLabelWrap>
                            <tw.DetailTextWrap>
                                <tw.DetailText>{bookingData?.name}</tw.DetailText>
                            </tw.DetailTextWrap>
                        </tw.DetailRow>
                        <tw.DetailRow>
                            <tw.DetailLabelWrap>
                                <tw.DetailLabel>대표 전화번호</tw.DetailLabel>
                            </tw.DetailLabelWrap>
                            <tw.DetailTextWrap>
                                <tw.DetailText>{bookingData?.mobile}</tw.DetailText>
                            </tw.DetailTextWrap>
                        </tw.DetailRow>
                        <tw.DetailRow>
                            <tw.DetailLabelWrap>
                                <tw.DetailLabel>결제금액</tw.DetailLabel>
                            </tw.DetailLabelWrap>
                            <tw.DetailTextWrap>
                                <tw.DetailText>{bookingData?.total_price.toLocaleString()}원</tw.DetailText>
                            </tw.DetailTextWrap>
                        </tw.DetailRow>
                    </tw.DetailWrap>
                    <tw.MgmtWrap>
                        <tw.MgmtBtn>예약 취소</tw.MgmtBtn>
                        <tw.MgmtBtn>예약 변경</tw.MgmtBtn>
                        <tw.MgmtBtn>요청하기</tw.MgmtBtn>
                    </tw.MgmtWrap>
                </tw.ContentsWrap>
            </tw.MobileWrap>

            {loading && (
                <ModalPortal>
                    <LoadingModal onClose={closeLoadingModal} />
                </ModalPortal>
            )}

            {isKakaoMapModalOpen && (
                <ModalPortal>
                    <KakaoMapModal
                        hotelName={hotelData.name}
                        address={`${hotelData.address} ${hotelData.address_detail}`}
                        imgUrl={getThumbnailCFUrl(`/hotel_img/${hotelData.id}`)}
                        onClose={closeKakaoMapModal}
                    />
                </ModalPortal>
            )}
        </tw.Container>
    );
}
