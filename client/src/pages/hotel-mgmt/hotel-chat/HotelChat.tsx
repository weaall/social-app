import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Loading from "../../../components/loading/Loading";
import ImgLoader from "../../../utils/imgLoader";

import { axiosInstance, handleAxiosError } from "../../../utils/axios.utils";
import { sendJWT } from "../../../utils/jwtUtils";
import { msgDateFormat } from "../../../utils/msg.utils";
import { decrypt } from "../../../utils/cryptoJs";

import * as tw from "./HotelChat.styles";


interface MsgList {
    hotel_id: number;
    user_id: number;
    text: string;
    created_at: string;
    by_user: number;
}

interface HotelData {
    name: string;
    img: Image;
}

interface Image {
    url: string;
}

export default function HotelChatPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [msgList, setMsgList] = useState<MsgList[]>([]);
    const [hotelData, setHotelData] = useState<HotelData>();
    const [text, setText] = useState("");

    const { encryptedHotelId, encryptedUserId } = useParams();

    const id = decrypt(encryptedHotelId || "");
    const userId = decrypt(encryptedUserId || "");

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newText = e.target.value;
        if (newText.length <= 150) {
            setText(newText);
        }
    };

    const handleResizeHeight = useCallback(() => {
        if (textarea.current) {
            textarea.current.style.height = "auto";
            textarea.current.style.height = `${textarea.current.scrollHeight}px`;
        }
    }, []);

    const fetchChatOnly = async () => {
        try {
            const config = await sendJWT({
                method: "GET",
                url: "/msg/hotel/chat/" + id + "/" + userId,
            });

            const response = await axiosInstance.request(config);
            setMsgList(response.data.data);
        } catch (error) {
            handleAxiosError(error, navigate);
        }
    };

    const fetchChat = async () => {
        try {
            const config = await sendJWT({
                method: "GET",
                url: "/msg/hotel/chat/" + id + "/" + userId,
            });

            const response = await axiosInstance.request(config);
            setMsgList(response.data.data);
            await fetchHotel();
            await fetchHotelImg();
        } catch (error) {
            handleAxiosError(error, navigate);
        } finally {
            setLoading(false);
        }
    };

    const fetchHotel = async () => {
        try {
            const response = await axiosInstance.get("/hotel/" + id);
            setHotelData(response.data.data[0]);
        } catch (error) {
            handleAxiosError(error, navigate);
        }
    };

    const fetchHotelImg = async () => {
        try {
            const response = await axiosInstance.get("/hotel/img/" + id);
            setHotelData((prevData) => ({
                name: prevData?.name || "",
                img: response.data.data[0],
            }));
        } catch (error) {
            handleAxiosError(error, navigate);
        }
    };

    const onClickSendMsg = async () => {
        try {
            const config = await sendJWT({
                method: "post",
                url: "/msg/hotel/send",
                data: {
                    user_id: userId,
                    hotel_id: id,
                    text: text,
                },
            });

            await axiosInstance.request(config);
            fetchChatOnly();
            setText("");
        } catch (error) {
            handleAxiosError(error, navigate);
        }
    };

    useEffect(() => {
        fetchChat();
    }, [userId]);

    const listWrapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!loading && listWrapRef.current) {
            listWrapRef.current.scrollTop = listWrapRef.current.scrollHeight;
        }
    }, [loading]);

    useEffect(() => {
        if (listWrapRef.current) {
            listWrapRef.current.scrollTop = listWrapRef.current.scrollHeight;
        }
    }, [msgList]);

    const textarea = useRef<HTMLTextAreaElement>(null);

    if (loading) {
        return <Loading />;
    }

    return (
        <tw.Container>
            <tw.ContentsWrap>
                <tw.MsgWrap>
                    <tw.ListWrap ref={listWrapRef}>
                        {msgList.map((msg) => (
                            <tw.ChatWrap key={msg.created_at} $byUser={msg.by_user}>
                                <tw.Pic>
                                    {msg.by_user === 1 ? (
                                        <tw.AddTextSvg alt="" src={require("../../../assets/svg/user_icon.svg").default} />
                                    ) : hotelData?.img?.url ? (
                                        <ImgLoader imageUrl={hotelData.img.url} altText="" rounded="full" />
                                    ) : (
                                        <tw.UnRegWrap>미등록</tw.UnRegWrap>
                                    )}
                                </tw.Pic>
                                <tw.MsgInfoWrap>
                                    <tw.Name $byUser={msg.by_user}>{msg.by_user === 1 ? "고객" : hotelData?.name}</tw.Name>
                                    <tw.TextWrap $byUser={msg.by_user}>
                                        <tw.Text>{msg.text}</tw.Text>
                                    </tw.TextWrap>
                                </tw.MsgInfoWrap>
                                <tw.TimeWrap>
                                    <tw.Time>{msgDateFormat(msg.created_at)}</tw.Time>
                                </tw.TimeWrap>
                            </tw.ChatWrap>
                        ))}
                    </tw.ListWrap>
                    <tw.AddTextWrap>
                        <tw.AddTextBox>
                            <tw.AddTextField ref={textarea} onInput={handleResizeHeight} rows={1} value={text} onChange={handleTextChange}></tw.AddTextField>
                            <tw.AddTextBtnWrap className="absolute bottom-1.5 end-3 z-10">
                                <tw.AddTextBtn onClick={onClickSendMsg}>
                                    <tw.AddTextSvg alt="" src={require("../../../assets/svg/send_btn.svg").default} />
                                </tw.AddTextBtn>
                            </tw.AddTextBtnWrap>
                        </tw.AddTextBox>
                        <tw.AddTextNum>{text.length}/150</tw.AddTextNum>
                    </tw.AddTextWrap>
                </tw.MsgWrap>
            </tw.ContentsWrap>
        </tw.Container>
    );
};
