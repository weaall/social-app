import { useNavigate, useParams } from "react-router-dom";
import { axios, axiosInstance } from "../../utils/axios.utils";
import { useEffect, useState } from "react";

import * as tw from "./Hotel.styles";
import Loading from "../../components/loading/Loading";
import ImgSlider from "../../components/imgSlider/imgSlider";
import { facilItems, servItems } from "../../data/hotelData";
import { decrypt, encrypt } from "../../utils/cryptoJs";
import SearchBoxSlim from "../../components/searchBoxSlim/SearchBoxSlim";
import SearchBox from "../../components/searchBox/SearchBox";
import ImgSliderMain from "../../components/imgSliderMain/imgSliderMain";
import dayjs from "dayjs";
import { ModalPortal } from "../../hook/modal/ModalPortal";
import KakaoMapModal from "../../hook/modal/kakao-map/KakaMap.modal";

export default function Hotel() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    const [isKakaoMapModalOpen, setIsKakaoMapModalOpen] = useState(false);

    const openKakaoMapModal = () => {
        setIsKakaoMapModalOpen(true);
    };

    const closeKakaoMapModal = () => {
        setIsKakaoMapModalOpen(false);
    };

    const { encryptedId, startDate, endDate, adult, child } = useParams();

    const id = decrypt(encryptedId || "");

    const [hotelData, setHotelData] = useState({
        id: id,
        name: "",
        address: "",
        address_detail: "",
        description: "",

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

        img: [
            {
                url: "",
            },
        ],
    });

    const [roomList, setRoomList] = useState([
        {
            id: 0,
            name: "",
            num: 0,
            view_type: "",
            bed_type: "",
            discount: 0,

            room_price: [
                {
                    date: "",
                    price: 0,
                    room_current: 0,
                    room_limit: 0,
                },
            ],

            img: [
                {
                    url: "",
                },
            ],
        },
    ]);

    const fetchHotel = async () => {
        try {
            const response = await axiosInstance.get("/hotel/" + id);
            setHotelData(response.data.data[0]);
            fetchHotelImg();
            fetchRoom();
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                if (error.response.status === 401) {
                    window.alert("올바른 접근이 아닙니다.");
                    navigate("/");
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchHotelImg = async () => {
        try {
            const response = await axiosInstance.get("/hotel/img/" + id);
            setHotelData((prevState) => ({
                ...prevState,
                img: response.data.data,
            }));
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                if (error.response.status === 401) {
                    window.alert("올바른 접근이 아닙니다.");
                    navigate("/");
                }
            }
        }
    };

    const fetchRoom = async () => {
        try {
            const response = await axiosInstance.get("/room/hotel/" + id);
            const rooms = response.data.data;

            for (let room of rooms) {
                const roomImgResponse = await axiosInstance.get(`/room/img/${room.id}`);
                room.img = roomImgResponse.data.data;

                const roomPriceresponse = await axiosInstance.get(`/room/price/${room.id}`, {
                    params: {
                        startDate: startDate,
                        endDate: endDate,
                    },
                });
                room.room_price = roomPriceresponse.data.data;
            }

            setRoomList(rooms);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                if (error.response.status === 401) {
                    window.alert("올바른 접근이 아닙니다.");
                    navigate("/");
                }
            }
        }
    };

    const clickRoom = (hotelId : number, roomId : number) =>{
        const encryptedHotelId = encrypt(`${hotelId}`);
        const encryptedRoomId = encrypt(`${roomId}`);
        navigate(`/payment/${encryptedHotelId}/${encryptedRoomId}/${startDate}/${endDate}`);
    }

    useEffect(() => {
        fetchHotel();
    }, [startDate,endDate]);

    if (loading) {
        return <Loading />;
    }

    return (
        <tw.Container>
            <tw.MainContainer>
                <tw.SearchWrap>
                    <SearchBoxSlim
                        defaultSearchValue={hotelData.name}
                        defaultStartDate={startDate}
                        defaultEndDate={endDate}
                        defaultAdult={parseInt(adult || "2")}
                        defaultChild={parseInt(child || "0")}
                        currentHotelId={id}
                        currentHotelName={hotelData.name}
                    />
                </tw.SearchWrap>
                <tw.SearchWrapMobile>
                    <SearchBox
                        defaultSearchValue={hotelData.name}
                        defaultStartDate={startDate}
                        defaultEndDate={endDate}
                        defaultAdult={parseInt(adult || "2")}
                        defaultChild={parseInt(child || "0")}
                        currentHotelId={id}
                        currentHotelName={hotelData.name}
                    />
                </tw.SearchWrapMobile>
                <tw.HotelWrap>
                    <tw.HotelPic>
                        <ImgSliderMain images={hotelData.img} />
                    </tw.HotelPic>
                    <tw.HotelInfoWrap>
                        <tw.HotelFlexWrap>
                            <tw.HotelTitle>{hotelData.name}</tw.HotelTitle>
                            <tw.ContentsFlex>
                                <tw.AddressSVG alt="" src={require("../../assets/svg/location_icon.svg").default} />
                                <tw.HotelAddress onClick={openKakaoMapModal}>
                                    {hotelData.address} {hotelData.address_detail}
                                </tw.HotelAddress>
                            </tw.ContentsFlex>
                            <tw.HotelDesc>{hotelData.description}</tw.HotelDesc>
                        </tw.HotelFlexWrap>
                        <tw.HotelFlexWrap>
                            <tw.Label>서비스 / 편의시설</tw.Label>
                            <tw.HotelServ>
                                {servItems.map((item) =>
                                    (hotelData as any)[item.comp] === 1 ? (
                                        <tw.HotelTextWrap key={item.comp}>
                                            <tw.HotelSvg alt="" src={require("../../assets/svg/check_icon.svg").default} />
                                            <tw.HotelText key={item.comp}>{item.label}</tw.HotelText>
                                        </tw.HotelTextWrap>
                                    ) : null,
                                )}
                                {facilItems.map((item) =>
                                    (hotelData as any)[item.comp] === 1 ? (
                                        <tw.HotelTextWrap key={item.comp}>
                                            <tw.HotelSvg alt="" src={require("../../assets/svg/check_icon.svg").default} />
                                            <tw.HotelText key={item.comp}>{item.label}</tw.HotelText>
                                        </tw.HotelTextWrap>
                                    ) : null,
                                )}
                            </tw.HotelServ>
                        </tw.HotelFlexWrap>
                    </tw.HotelInfoWrap>
                </tw.HotelWrap>

                <tw.RoomList>
                    <tw.Label>객실정보</tw.Label>
                    {roomList.map((room) => (
                        <tw.RoomWrap key={room.id}>
                            <tw.ContentsFlex>
                                <tw.RoomPic>
                                    <ImgSlider images={room.img} />
                                </tw.RoomPic>
                                <tw.RoomInfoWrap>
                                    <tw.HotelInfo>
                                        <tw.InfoWrap>
                                            <tw.RoomName>{room.name}</tw.RoomName>
                                            <tw.RoomText>{room.view_type}</tw.RoomText>
                                            <tw.RoomText>
                                                {room.bed_type} / {room.num}인
                                            </tw.RoomText>
                                        </tw.InfoWrap>
                                        <tw.PriceWrap>
                                            <tw.TotalLabel>{startDate}~</tw.TotalLabel>
                                            <tw.TotalLabel>{dayjs(endDate).diff(dayjs(startDate), "day")}박 총 요금</tw.TotalLabel>
                                            <tw.TotalPrice>
                                                {room.room_price.reduce((total, room) => total + room.price, 0).toLocaleString()}원
                                            </tw.TotalPrice>
                                            {room.room_price.some((priceData) => priceData.room_limit === priceData.room_current) ? (
                                                <tw.BookBtnWrap>
                                                    <tw.BookBtn>객실이 모두 소진되었습니다.</tw.BookBtn>
                                                </tw.BookBtnWrap>
                                            ) : (
                                                <tw.BookBtnWrap>
                                                    <tw.BookBtn onClick={() => clickRoom(parseInt(hotelData.id), room.id)}>
                                                        예약하기
                                                    </tw.BookBtn>
                                                </tw.BookBtnWrap>
                                            )}
                                        </tw.PriceWrap>
                                    </tw.HotelInfo>
                                </tw.RoomInfoWrap>
                            </tw.ContentsFlex>
                        </tw.RoomWrap>
                    ))}
                </tw.RoomList>
            </tw.MainContainer>

            {isKakaoMapModalOpen && (
                <ModalPortal>
                    <KakaoMapModal
                        hotelName={hotelData.name}
                        address={`${hotelData.address} ${hotelData.address_detail}`}
                        imgUrl={hotelData.img[0].url}
                        onClose={closeKakaoMapModal}
                    />
                </ModalPortal>
            )}
        </tw.Container>
    );
}
