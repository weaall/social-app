import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import Cookies from "js-cookie";

import { ModalPortal } from "../../hook/modal/ModalPortal";
import KakaoMapModal from "../../hook/modal/kakao-map/KakaMap.modal";
import { CheckoutModal } from "../../hook/modal/checkout/Checkout.modal";
import LoadingModal from "../../hook/modal/loading/Loading.modal";

import { axiosInstance, handleAxiosError } from "../../utils/axios.utils";
import { decrypt } from "../../utils/cryptoJs";
import { checkValidEmail, checkValidMobile, checkValidUserName } from "../../utils/regExp.utils";
import ImgLoader from "../../utils/imgLoader";
import { sendJWT } from "../../utils/jwtUtils";
import { getThumbnailCFUrl } from "../../utils/s3UrlToCFD.utils";

import * as tw from "./Payment.styles";

export default function Payment() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const openLoadingModal = () => {
        setLoading(true);
    };
    const closeLoadingModal = () => {
        setLoading(false);
    };

    const { encryptedHotelId, encryptedRoomId, checkInDate, checkOutDate } = useParams();

    const hotelId = decrypt(encryptedHotelId || "");
    const roomId = decrypt(encryptedRoomId || "");

    const [isKakaoMapModalOpen, setIsKakaoMapModalOpen] = useState(false);

    const openKakaoMapModal = () => {
        setIsKakaoMapModalOpen(true);
    };

    const closeKakaoMapModal = () => {
        setIsKakaoMapModalOpen(false);
    };

    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

    const openCheckoutModal = () => {
        setIsCheckoutModalOpen(true);
    };

    const closeCheckoutModal = () => {
        setIsCheckoutModalOpen(false);
    };

    const initialFormData = {
        name: "",
        email: "",
        mobile: "",
    };

    const [formData, setFormData] = useState(initialFormData);

    const [fetchedFormData, setFetchedFormData] = useState({
        name: "",
        email: "",
        mobile: "",
    });

    const [formValid, setFormValid] = useState({
        isUserName: false,
        isMobile: false,
        isEmail: false,
    });

    const isFormValid = () => {
        return (
            formValid.isEmail &&
            formData.email !== "" &&
            formValid.isUserName &&
            formData.name !== "" &&
            formValid.isMobile &&
            formData.mobile !== "" &&
            termsValid
        );
    };

    const fetchUser = async () => {
        try {
            const config = await sendJWT({
                method: "get",
                url: "/user/me",
            });

            const response = await axiosInstance.request(config);
            const userData = response.data.data[0];
            setFetchedFormData(userData);
            setFormData(userData);

            setFormValid({
                isUserName: true,
                isEmail: true,
                isMobile: true,
            });
        } catch (error) {
            handleAxiosError(error, navigate);
        }
    };

    const [termsValid, setTermsValid] = useState(false);

    const [userCheck, setUserCheck] = useState(false);

    const handleInput = (e: React.FormEvent<HTMLInputElement>, validationFunction: (value: string) => boolean, validationKey: string) => {
        const { value } = (e as React.ChangeEvent<HTMLInputElement>).target;
        setFormValid({
            ...formValid,
            [validationKey]: validationFunction(value),
        });
    };

    const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const sanitizedValue = name === "mobile" ? value.replace(/[^0-9]/g, "").replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3") : value;
        setFormData({ ...formData, [name]: sanitizedValue });
    };

    const [hotelData, setHotelData] = useState({
        id: hotelId,
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
        room_id: 0,
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
    });

    const fetchRoom = async () => {
        try {
            const roomResponse = await axiosInstance.get("/room/" + roomId);
            const room = roomResponse.data.data[0];

            const roomPriceResponse = await axiosInstance.get("/room/price/" + roomId, {
                params: {
                    checkInDate: checkInDate,
                    checkOutDate: checkOutDate,
                },
            });
            room.room_price = roomPriceResponse.data.data;

            setRoomData(room);
        } catch (error) {
            handleAxiosError(error, navigate);
        }
    };

    const fetchHotel = useCallback(async () => {
        openLoadingModal();
        try {
            const hotelResponse = await axiosInstance.get("/hotel/" + hotelId);
            let hotelData = hotelResponse.data.data[0];

            setHotelData(hotelData);
            fetchRoom();
        } catch (error) {
            handleAxiosError(error, navigate);
        } finally {
            closeLoadingModal();
        }
    }, [navigate, hotelId, fetchRoom]);

    useEffect(() => {
        const jwtToken = Cookies.get("jwt");
        if (!jwtToken) {
            alert("로그인해주세요.");
            navigate("/signin");
            return;
        }
    });

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchUser();
        fetchHotel();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (userCheck) {
            setFormData(initialFormData);
        } else {
            setFormData(fetchedFormData);
            setFormValid({
                isUserName: true,
                isEmail: true,
                isMobile: true,
            });
        }
    }, [userCheck]);

    return (
        <tw.Container>
            <tw.MainContainer>
                <tw.LeftWrap>
                    <tw.UserWrap>
                        <tw.LabelWrap>
                            <tw.Label>예약자 정보</tw.Label>
                            <tw.UserInfoWrap>
                                <tw.InfoLabel>다른사람을 위해 예약</tw.InfoLabel>
                                <tw.PolicyCheck type="checkbox" checked={userCheck} onChange={() => setUserCheck((prevUserCheck) => !prevUserCheck)} />
                            </tw.UserInfoWrap>
                        </tw.LabelWrap>
                        <tw.UserLabel $validator={formValid.isUserName}>이름</tw.UserLabel>
                        <tw.UserInput
                            onChange={onChangeInput}
                            onInput={(e) => handleInput(e, checkValidUserName, "isUserName")}
                            value={formData.name}
                            name="name"
                            maxLength={8}
                            $validator={formValid.isUserName}
                        />
                        <tw.UnderTag draggable="true" $validator={formValid.isUserName}>
                            {formData.name === "" ? "" : formValid.isUserName === false ? "올바른 이름을 입력해주세요." : ""}
                        </tw.UnderTag>
                        <tw.UserLabel $validator={formValid.isMobile}>전화번호</tw.UserLabel>
                        <tw.UserInput
                            onChange={onChangeInput}
                            onKeyUp={(e) => handleInput(e, checkValidMobile, "isMobile")}
                            value={formData.mobile}
                            name="mobile"
                            maxLength={13}
                            $validator={formValid.isMobile}
                        />
                        <tw.UnderTag draggable="true" $validator={formValid.isMobile}>
                            {formData.mobile === "" ? "" : formValid.isMobile === false ? "올바른 전화번호를 입력해주세요." : ""}
                        </tw.UnderTag>
                        <tw.UserLabel $validator={formValid.isEmail}>이메일</tw.UserLabel>
                        <tw.UserInput
                            onChange={onChangeInput}
                            onInput={(e) => handleInput(e, checkValidEmail, "isEmail")}
                            value={formData.email}
                            name="email"
                            maxLength={30}
                            $validator={formValid.isEmail}
                        />
                        <tw.UnderTag draggable="true" $validator={formValid.isEmail}>
                            {formData.email === "" ? "" : formValid.isEmail === false ? "travel@travel.co.kr 형식으로 입력해 주세요." : ""}
                        </tw.UnderTag>
                    </tw.UserWrap>

                    <tw.PolicyWrap>
                        <tw.Label>개인정보보호</tw.Label>
                        <tw.ContentsFlex>
                            <tw.PolicyCheck type="checkbox" checked={termsValid} onChange={() => setTermsValid((prevTermsValid) => !prevTermsValid)} />
                            <tw.PolicyTextMain>다음의 모든 항목에 동의합니다.</tw.PolicyTextMain>
                        </tw.ContentsFlex>
                        <tw.PolicyText>[필수] 본인은 이용약관에동의하며 18세 이상임을 확인합니다.</tw.PolicyText>
                        <tw.PolicyText>[필수] 개인정보 처리방침에 따라 본인의 개인 정보를 사용하고 수집하는 것에 동의합니다.</tw.PolicyText>
                    </tw.PolicyWrap>

                    <tw.PaymentBtnMobile onClick={openCheckoutModal} $validator={isFormValid()} disabled={!isFormValid()}>
                        결제하기
                    </tw.PaymentBtnMobile>
                </tw.LeftWrap>
                <tw.RightWrap>
                    <tw.OuterWrap>
                        <tw.RoomWrap>
                            <tw.ContentsFlex>
                                <tw.Pic>
                                    <ImgLoader
                                        imageUrl={getThumbnailCFUrl(`/hotel_img/${hotelData.id}`)}
                                        altText=""
                                        rounded="l-xl mobile:rounded-none mobile:rounded-t-xl"
                                    />
                                </tw.Pic>
                                <tw.RoomInfoWrap>
                                    <tw.RoomInfo>
                                        <tw.HotelInfoWrap>
                                            <tw.HotelTitle>{hotelData.name}</tw.HotelTitle>
                                            <tw.AddressWrap>
                                                    <tw.AddressSVG alt="" src={require("../../assets/svg/location_icon.svg").default} />
                                                    <tw.HotelAddress onClick={openKakaoMapModal}>
                                                        {hotelData.address} {hotelData.address_detail}, {hotelData.postcode}
                                                    </tw.HotelAddress>
                                                </tw.AddressWrap>
                                        </tw.HotelInfoWrap>
                                    </tw.RoomInfo>
                                </tw.RoomInfoWrap>
                            </tw.ContentsFlex>
                        </tw.RoomWrap>
                        <tw.RoomWrap>
                            <tw.ContentsFlex>
                                <tw.Pic>
                                    <ImgLoader
                                        imageUrl={getThumbnailCFUrl(`/room_img/${hotelData.id}/${roomData.room_id}`)}
                                        altText=""
                                        rounded="l-xl mobile:rounded-none mobile:rounded-t-xl"
                                    />
                                </tw.Pic>
                                <tw.RoomInfoWrap>
                                    <tw.RoomInfo>
                                        <tw.InfoWrap>
                                            <tw.RoomName>{roomData.name}</tw.RoomName>
                                            <tw.RoomText>{roomData.view_type}</tw.RoomText>
                                            <tw.RoomText>
                                                {roomData.bed_type} / 최대인원: {roomData.num}명
                                            </tw.RoomText>
                                        </tw.InfoWrap>
                                    </tw.RoomInfo>
                                </tw.RoomInfoWrap>
                            </tw.ContentsFlex>
                        </tw.RoomWrap>
                    </tw.OuterWrap>
                    <tw.PriceWrap>
                        <tw.PriceRow>
                            <tw.PriceLabel>객실 가격 ({dayjs(checkOutDate).diff(dayjs(checkInDate), "day")}박)</tw.PriceLabel>
                            <tw.PriceLabel>{roomData.room_price.reduce((total, room) => total + room.price, 0).toLocaleString()}원</tw.PriceLabel>
                        </tw.PriceRow>
                        <tw.PriceRow>
                            <tw.PriceLabel>예약 수수료</tw.PriceLabel>
                            <tw.PriceLabel>없음</tw.PriceLabel>
                        </tw.PriceRow>
                        <tw.TotalPriceRow>
                            <tw.TotalLabel>합계</tw.TotalLabel>
                            <tw.TotalPrice>{roomData.room_price.reduce((total, room) => total + room.price, 0).toLocaleString()}원</tw.TotalPrice>
                        </tw.TotalPriceRow>
                        <tw.DateLabel>{checkInDate} ~ {checkOutDate} ({dayjs(checkOutDate).diff(dayjs(checkInDate), "day")}박)</tw.DateLabel>
                    </tw.PriceWrap>
                    <tw.PaymentBtn onClick={openCheckoutModal} $validator={isFormValid()} disabled={!isFormValid()}>
                        결제하기
                    </tw.PaymentBtn>
                </tw.RightWrap>
            </tw.MainContainer>

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

            {isCheckoutModalOpen && (
                <ModalPortal>
                    <CheckoutModal
                        checkInDate={checkInDate || ""}
                        checkOutDate={checkOutDate || ""}
                        hotelId={hotelData.id}
                        hotelName={hotelData.name}
                        roomId={roomId}
                        totalPrice={roomData.room_price.reduce((total, room) => total + room.price, 0)}
                        orderName={`${hotelData.name} ${roomData.name}`}
                        customerName={formData.name}
                        customerEmail={formData.email}
                        customerMobilePhone={formData.mobile}
                        onClose={closeCheckoutModal}
                    />
                </ModalPortal>
            )}
        </tw.Container>
    );
}
