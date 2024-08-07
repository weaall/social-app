import { useNavigate, useParams } from "react-router-dom";
import { axiosInstance, handleAxiosError } from "../../utils/axios.utils";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

import Loading from "../../components/loading/Loading";
import { facilItems, servItems } from "../../data/hotelData";
import ImgSlider from "../../components/imgSlider/imgSlider";
import SearchBox from "../../components/searchBox/SearchBox";
import { encrypt } from "../../utils/cryptoJs";

import * as tw from "./SearchResult.styles";

export default function SearchResult() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const { searchValue, checkInDate, checkOutDate, adult, child } = useParams();

    const [hotelList, setHotelList] = useState([
        {
            hotel_id: 0,
            name: "",
            address: "",
            address_detail: "",

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

            room_id: 0,
            room_name: "",
            room_num: 0,
            discount: 0,

            room_price: [
                {
                    room_id: 0,
                    date: "",
                    price: 0,
                    room_current: 0,
                    room_limit: 0,
                },
            ],

            hotel_img: [
                {
                    url: "",
                },
            ],
        },
    ]);

    const fetchSearch = async () => {
        try {
            const response = await axiosInstance.get("/search", {
                params: {
                    searchValue: encodeURIComponent(`${searchValue}`),
                    checkInDate: checkInDate,
                    checkOutDate: checkOutDate,
                    adult: adult,
                    child: child,
                },
            });
            setHotelList(response.data.data);
        } catch (error) {
            handleAxiosError(error, navigate);
        } finally {
            setLoading(false);
        }
    };

    const clickHotel = (hotelId : number) =>{
        const encryptedId = encrypt(`${hotelId}`);
        navigate(`/hotel/${encryptedId}/${checkInDate}/${checkOutDate}/${adult}/${child}`);
    }

    useEffect(() => {
        fetchSearch();
    }, [searchValue, checkInDate, checkOutDate, adult, child]);

    const sortedHotelList = [...hotelList].sort((a, b) => {
        const totalPriceA = a.room_price.reduce((total, room) => total + room.price, 0);
        const totalPriceB = b.room_price.reduce((total, room) => total + room.price, 0);

        if (totalPriceA === 0 && totalPriceB !== 0) {
            return 1;
        } else if (totalPriceA !== 0 && totalPriceB === 0) {
            return -1;
        } else {
            return totalPriceA - totalPriceB;
        }
    });

    if (loading) {
        return <Loading />;
    }

    return (
        <tw.Container>
            <tw.MainContainer>
                <SearchBox
                    defaultSearchValue={searchValue}
                    defaultStartDate={checkInDate}
                    defaultEndDate={checkOutDate}
                    defaultAdult={parseInt(adult || "2")}
                    defaultChild={parseInt(child || "0")}
                />

                <tw.HotelList>
                    {sortedHotelList.length === 0 ? (
                        <tw.NoHotelWrap>
                            <tw.NoHotelText>검색결과가 없어요!</tw.NoHotelText>
                            <tw.AddHotelBtn onClick={() => navigate("/")}>숙소검색하기</tw.AddHotelBtn>
                        </tw.NoHotelWrap>
                    ) : (
                        sortedHotelList.map((hotel) => (
                            <tw.HotelWrap key={hotel.hotel_id}>
                                <tw.HotelPic>
                                    <ImgSlider images={hotel.hotel_img} />
                                </tw.HotelPic>
                                <tw.HotelInfoWrap onClick={() => clickHotel(hotel.hotel_id)}>
                                    <tw.HotelInfo>
                                        <tw.HotelName>{hotel.name}</tw.HotelName>
                                        <tw.ContentsFlex>
                                            <tw.AddressSVG
                                                alt=""
                                                src={require("../../assets/svg/location_icon.svg").default}
                                            ></tw.AddressSVG>
                                            <tw.HotelAddress>
                                                {hotel.address} {hotel.address_detail}
                                            </tw.HotelAddress>
                                        </tw.ContentsFlex>

                                        <tw.HotelServWrap>
                                            <tw.HotelP>서비스</tw.HotelP>
                                            <tw.HotelServList>
                                                {servItems.map((item) =>
                                                    (hotel as any)[item.comp] === 1 ? (
                                                        <tw.HotelComp key={item.comp}>{item.label}</tw.HotelComp>
                                                    ) : null,
                                                )}
                                            </tw.HotelServList>
                                        </tw.HotelServWrap>

                                        <tw.HotelFacilWrap>
                                            <tw.HotelP>편의시설</tw.HotelP>
                                            <tw.HotelFacilList>
                                                {facilItems.map((item) =>
                                                    (hotel as any)[item.comp] === 1 ? (
                                                        <tw.HotelComp key={item.comp}>{item.label}</tw.HotelComp>
                                                    ) : null,
                                                )}
                                            </tw.HotelFacilList>
                                        </tw.HotelFacilWrap>

                                        <tw.TooltipServ>
                                            {servItems.map((item) =>
                                                (hotel as any)[item.comp] === 1 ? (
                                                    <tw.ToolTipText key={item.comp}>{item.label}</tw.ToolTipText>
                                                ) : null,
                                            )}
                                        </tw.TooltipServ>
                                        <tw.TooltipFacil>
                                            {facilItems.map((item) =>
                                                (hotel as any)[item.comp] === 1 ? (
                                                    <tw.ToolTipText key={item.comp}>{item.label}</tw.ToolTipText>
                                                ) : null,
                                            )}
                                        </tw.TooltipFacil>

                                        <tw.PriceWrap>
                                            <tw.TotalLabel>
                                                {dayjs(checkOutDate).diff(dayjs(checkInDate), "day")}박 총 요금
                                            </tw.TotalLabel>
                                            <tw.TotalPrice>
                                                {hotel.room_price
                                                    .reduce((total, room) => total + room.price, 0)
                                                    .toLocaleString()}
                                                원~
                                            </tw.TotalPrice>
                                        </tw.PriceWrap>
                                    </tw.HotelInfo>
                                </tw.HotelInfoWrap>
                            </tw.HotelWrap>
                        ))
                    )}
                </tw.HotelList>
            </tw.MainContainer>
        </tw.Container>
    );
}