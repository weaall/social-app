import React, { useState } from "react";
import { sendJWT } from "../../../utils/jwtUtils";
import { axiosInstance, handleAxiosError } from "../../../utils/axios.utils";
import { useNavigate } from "react-router-dom";

import * as tw from "./SetDatePrice.modal.styles"

interface ModalProps {
    onClose: () => void;
    hotel_id: string | undefined;
    room_id: string | undefined;
    year: number;
    month: number;
    date : number;

}

export default function SetPriceByDateModal({ onClose, hotel_id, room_id, year, month, date }: ModalProps) {
    const navigate = useNavigate();

    const [priceData, setPriceData] = useState({
        hotel_id: hotel_id,
        room_id: room_id,
        year: year,
        month: month,
        date: date,
        price: "",
        room_limit: "",
    });

    const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPriceData({ ...priceData, [name]: value.replace(/[^0-9]/g, "") });
    };

    const isFormValid = () => {
        return priceData.price.toString().trim() !== "" && priceData.room_limit.toString().trim() !== ""
    };
    

    const onClickSave= async () => {
        if (window.confirm("저장하시겠습니까?")) {
            try {
                const config = await sendJWT({
                    method: "post",
                    url: "/room/price/date",
                    data: priceData,
                });
                await axiosInstance.request(config);
                window.alert("저장완료");
                onClose();
            } catch (error) {
                handleAxiosError(error, navigate);
            }
        }
    };

    return (
        <tw.Container>
            <tw.ModalWrap>
                <tw.TitleWrap>
                    <tw.CloseBtn onClick={onClose}>
                        <tw.CloseSVG alt="" src={require("../../../assets/svg/close_svg.svg").default}></tw.CloseSVG>
                    </tw.CloseBtn>
                    <tw.Title>가격설정</tw.Title>
                </tw.TitleWrap>
                <tw.SubTitle>
                    {year}년 {month}월 {date}일
                </tw.SubTitle>
                <tw.InputWrap>
                    <tw.UpperTag>금액</tw.UpperTag>
                    <tw.ContentsFlex>
                        <tw.Input onChange={onChangeInput} value={priceData.price} name="price" maxLength={7} />
                        <tw.Text>원</tw.Text>
                    </tw.ContentsFlex>
                    <tw.UpperTag>방갯수</tw.UpperTag>
                    <tw.ContentsFlex>
                        <tw.Input onChange={onChangeInput} value={priceData.room_limit} name="room_limit" maxLength={2} />
                        <tw.Text>개</tw.Text>
                    </tw.ContentsFlex>
                </tw.InputWrap>
                <tw.RegBtn
                    $validator={isFormValid()}
                    onClick={() => {
                        onClickSave();
                    }}
                    disabled={!isFormValid()}
                >
                    설정하기
                </tw.RegBtn>
            </tw.ModalWrap>
        </tw.Container>
    );
}
