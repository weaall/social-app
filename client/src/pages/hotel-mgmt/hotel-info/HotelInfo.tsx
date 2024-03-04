import React, { ChangeEvent, DragEvent, useEffect, useState } from "react";
import { sendJWT } from "../../../utils/jwtUtils";
import { axios, axiosInstance } from "../../../utils/axios.utils";
import { useNavigate } from "react-router-dom";
import { HotelDataInInfo } from "../../../interface/interfaces";

import * as tw from "./HotelInfo.styles";

interface ServData {
    hotel_id: number;
    wifi: number;
    always_check_in: number;
    breakfast: number;
    breakfast_price: number;
    barbecue: number;
}

interface FacilData {
    hotel_id: number;
    carpark: number;
    restaurant: number;
    cafe: number;
    swimming_pool: number;
    spa: number;
    fitness: number;
    convenience_store: number;
}

export default function HotelInfo({ hotelId }: { hotelId: string | undefined }) {
    const navigate = useNavigate();

    const [hotelData, setHotelData] = useState<HotelDataInInfo>();

    const [infoData, setInfoData] = useState({
        hotel_id: 0,
        description: "",
        check_in: 0,
        check_out: 0,
        tel_num: 0,
    });

    const [servData, setServData] = useState({
        hotel_id: 0,
        wifi: 0,
        always_check_in: 0,
        breakfast: 0,
        breakfast_price: 0,
        barbecue: 0,
    });

    const [facilData, setFacilData] = useState({
        hotel_id: 0,
        carpark: 0,
        restaurant: 0,
        cafe: 0,
        swimming_pool: 0,
        spa: 0,
        fitness: 0,
        convenience_store: 0,
    });

    const [files, setFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const imageUrl = "https://weaall-s3.s3.ap-northeast-2.amazonaws.com/jfGJvHfxD.png";

    const fetchImageFile = async () => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const file = new File([blob], "image.png", { type: "image/png" });

            setFiles([file]);
            setImagePreviews([URL.createObjectURL(file)]);
            console.log(files);
        } catch (error) {
            window.alert("올바른 접근이 아닙니다.");
            navigate("/");
        }
    };

    useEffect(() => {
        fetchImageFile();
    }, []);

    const onDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const onDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();

        const droppedFiles = e.dataTransfer.files;
        const newFiles = Array.from(droppedFiles).slice(0, 10 - files.length);
        setFiles((prevFiles) => [...prevFiles, ...newFiles]);

        const previews = [...files, ...newFiles].map((file) => URL.createObjectURL(file));
        setImagePreviews(previews);
    };

    const removeFile = (index: number) => {
        const newFiles = [...files];
        newFiles.splice(index, 1);
        setFiles(newFiles);

        const previews = newFiles.map((file) => URL.createObjectURL(file));
        setImagePreviews(previews);
    };

    const onChangeInfo = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setInfoData({ ...infoData, [name]: value });
    };

    const onChangeDesk = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setInfoData({ ...infoData, [name]: value });
    };

    const onChangeServ = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setServData({ ...servData, [name]: value });
    };

    const toggleServData = (key: keyof ServData) => {
        setServData((prevData) => ({
            ...prevData,
            [key]: prevData[key] === 1 ? 0 : 1,
        }));
    };

    const toggleFacilData = (key: keyof FacilData) => {
        setFacilData((prevData) => ({
            ...prevData,
            [key]: prevData[key] === 1 ? 0 : 1,
        }));
    };

    const fetchHotelData = async () => {
        try {
            const config = await sendJWT({
                method: "get",
                url: "/hotel/mgmt/info/" + hotelId,
            });

            const response = await axiosInstance.request(config);
            const fetchedData = response.data.data[0];
            console.log(response.data.data[0]);
            setHotelData(fetchedData);
            setInfoData({
                hotel_id: fetchedData.hotel_id,
                description: fetchedData.description,
                check_in: fetchedData.check_in,
                check_out: fetchedData.check_out,
                tel_num: fetchedData.tel_num,
            });
            setServData({
                hotel_id: fetchedData.hotel_id,
                wifi: fetchedData.wifi,
                always_check_in: fetchedData.always_check_in,
                breakfast: fetchedData.breakfast,
                breakfast_price: fetchedData.breakfast_price,
                barbecue: fetchedData.barbecue,
            });
            setFacilData({
                hotel_id: fetchedData.hotel_id,
                carpark: fetchedData.carpark,
                restaurant: fetchedData.restaurant,
                cafe: fetchedData.cafe,
                swimming_pool: fetchedData.swimming_pool,
                spa: fetchedData.spa,
                fitness: fetchedData.fitness,
                convenience_store: fetchedData.convenience_store,
            });
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                if (error.response.status === 409) {
                    window.alert("올바른 접근이 아닙니다.");
                    navigate("/");
                } else if (error.response.status === 401) {
                    window.alert("올바른 접근이 아닙니다.");
                    navigate("/main");
                }
            }
        }
    };

    const clickInfoSave = async () => {
        try {
            const allInfoData = new FormData();

            for (let i = 0; i < files.length; i++) {
                allInfoData.append("images", files[i]);
            }

            allInfoData.append("data", JSON.stringify(infoData));
            const config = await sendJWT({
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                method: "put",
                url: "/hotel/mgmt/info",
                data: allInfoData,
            });

            const response = await axiosInstance.request(config);
            window.alert(response);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                if (error.response.status === 409) {
                    window.alert("올바른 접근이 아닙니다.");
                } else {
                    window.alert("올바른 접근이 아닙니다.");
                }
            }
        }
    };

    const clickInfoReset = () => {
        if (window.confirm("되돌리시겠습니까?")) {
            if (hotelData) {
                setInfoData({
                    hotel_id: hotelData.hotel_id,
                    description: hotelData.description,
                    check_in: hotelData.check_in,
                    check_out: hotelData.check_out,
                    tel_num: hotelData.tel_num,
                });
            }
        }
    };

    const clickServSave = async () => {
        if (window.confirm("저장하시겠습니까?")) {
            try {
                const config = await sendJWT({
                    method: "put",
                    url: "/hotel/mgmt/serv",
                    data: servData,
                });
                const response = await axiosInstance.request(config);
                window.alert("저장완료");
                fetchHotelData();
            } catch (error) {
                if (axios.isAxiosError(error) && error.response) {
                    if (error.response.status === 409) {
                        window.alert("올바른 접근이 아닙니다.");
                        navigate("/");
                    } else if (error.response.status === 401) {
                        window.alert("올바른 접근이 아닙니다.");
                        navigate("/main");
                    }
                }
            }
        } else {
        }
    };

    const clickServReset = () => {
        if (window.confirm("되돌리시겠습니까?")) {
            if (hotelData) {
                setServData({
                    hotel_id: hotelData.hotel_id,
                    wifi: hotelData.wifi,
                    always_check_in: hotelData.always_check_in,
                    breakfast: hotelData.breakfast,
                    breakfast_price: hotelData.breakfast_price,
                    barbecue: hotelData.barbecue,
                });
            }
        }
    };

    const clickFacilSave = async () => {
        if (window.confirm("저장하시겠습니까?")) {
            try {
                const config = await sendJWT({
                    method: "put",
                    url: "/hotel/mgmt/facil",
                    data: facilData,
                });
                const response = await axiosInstance.request(config);
                window.alert("저장완료");
                fetchHotelData();
            } catch (error) {
                if (axios.isAxiosError(error) && error.response) {
                    if (error.response.status === 409) {
                        window.alert("올바른 접근이 아닙니다.");
                        navigate("/");
                    } else if (error.response.status === 401) {
                        window.alert("올바른 접근이 아닙니다.");
                        navigate("/main");
                    }
                }
            }
        } else {
        }
    };

    const clickFacilReset = () => {
        if (window.confirm("되돌리시겠습니까?")) {
            if (hotelData) {
                setFacilData({
                    hotel_id: hotelData.hotel_id,
                    carpark: hotelData.carpark,
                    restaurant: hotelData.restaurant,
                    cafe: hotelData.cafe,
                    swimming_pool: hotelData.swimming_pool,
                    spa: hotelData.spa,
                    fitness: hotelData.fitness,
                    convenience_store: hotelData.convenience_store,
                });
            }
        }
    };

    useEffect(() => {
        fetchHotelData();
    }, [hotelId]);

    return (
        <tw.Container>
            <tw.ContentsWrap>
                <tw.ContentsFlex>
                    <tw.Title>숙소정보</tw.Title>
                    <tw.HalfFlex>
                        <tw.ResetBtn onClick={clickInfoReset}>되돌리기</tw.ResetBtn>
                        <tw.SetBtn onClick={clickInfoSave}>저장</tw.SetBtn>
                    </tw.HalfFlex>
                </tw.ContentsFlex>
                <tw.ContentsFlex>
                    <tw.HalfCol>
                        <tw.OptionWrap>
                            <tw.Label>전화번호</tw.Label>
                            <tw.InputBox value={infoData.tel_num} maxLength={11} name="tel_num" onChange={onChangeInfo}></tw.InputBox>
                        </tw.OptionWrap>

                        <tw.OptionWrap>
                            <tw.Label>체크인</tw.Label>
                            <tw.Select defaultValue={infoData.check_in}>
                                {[...Array(24).keys()].map((hour) => (
                                    <option key={hour} value={infoData.check_in}>
                                        {hour}
                                    </option>
                                ))}
                            </tw.Select>
                        </tw.OptionWrap>

                        <tw.OptionWrap>
                            <tw.Label>체크아웃</tw.Label>
                            <tw.Select defaultValue={infoData.check_out}>
                                {[...Array(24).keys()].map((hour) => (
                                    <option key={hour} value={infoData.check_out}>
                                        {hour}
                                    </option>
                                ))}
                            </tw.Select>
                        </tw.OptionWrap>
                    </tw.HalfCol>
                    <tw.HalfCol>
                        <tw.Label>설명</tw.Label>
                        <tw.DescInput value={infoData.description} name="description" 
                        onChange={onChangeDesk}></tw.DescInput>
                    </tw.HalfCol>
                </tw.ContentsFlex>
                <tw.UploadWrap onDragOver={onDragOver} onDrop={onDrop}>
                    <tw.ImgLabel>이미지를 드래그 앤 드롭하세요.</tw.ImgLabel>
                    <tw.ImgContainer>
                        {imagePreviews.map((preview, index) => (
                            <tw.ImgWrap key={index}>
                                <tw.RemoveBtn onClick={() => removeFile(index)} style={{ marginLeft: "10px" }}>
                                    삭제
                                </tw.RemoveBtn>
                                <tw.Img src={preview} alt={`이미지 미리보기 ${index + 1}`} draggable={false} />
                            </tw.ImgWrap>
                        ))}
                    </tw.ImgContainer>
                </tw.UploadWrap>
            </tw.ContentsWrap>

            <tw.ContentsWrap>
                <tw.ContentsFlex>
                    <tw.Title>서비스</tw.Title>
                    <tw.HalfFlex>
                        <tw.ResetBtn onClick={clickServReset}>되돌리기</tw.ResetBtn>
                        <tw.SetBtn onClick={clickServSave}>저장</tw.SetBtn>
                    </tw.HalfFlex>
                </tw.ContentsFlex>

                <tw.ContentsFlex>
                    <tw.HalfCol>
                        <tw.OptionWrap>
                            <tw.Label>와이파이</tw.Label>
                            <tw.CheckBox
                                type="checkbox"
                                checked={servData.wifi === 1}
                                onChange={() => toggleServData("wifi")}
                            ></tw.CheckBox>
                        </tw.OptionWrap>

                        <tw.OptionWrap>
                            <tw.Label>조식</tw.Label>
                            <tw.CheckBox
                                type="checkbox"
                                checked={servData.breakfast === 1}
                                onChange={() => toggleServData("breakfast")}
                            ></tw.CheckBox>
                        </tw.OptionWrap>

                        <tw.OptionWrap>
                            <tw.Label>조식금액</tw.Label>
                            <tw.InputBox
                                value={servData.breakfast_price}
                                name="breakfast_price"
                                onChange={onChangeServ}
                            ></tw.InputBox>
                        </tw.OptionWrap>
                    </tw.HalfCol>
                    <tw.HalfCol>
                        <tw.OptionWrap>
                            <tw.Label>24시 체크인</tw.Label>
                            <tw.CheckBox
                                type="checkbox"
                                checked={servData.always_check_in === 1}
                                onChange={() => toggleServData("always_check_in")}
                            ></tw.CheckBox>
                        </tw.OptionWrap>

                        <tw.OptionWrap>
                            <tw.Label>바베큐</tw.Label>
                            <tw.CheckBox
                                type="checkbox"
                                checked={servData.barbecue === 1}
                                onChange={() => toggleServData("barbecue")}
                            ></tw.CheckBox>
                        </tw.OptionWrap>
                    </tw.HalfCol>
                </tw.ContentsFlex>
            </tw.ContentsWrap>

            <tw.ContentsWrap>
                <tw.ContentsFlex>
                    <tw.Title>편의시설</tw.Title>
                    <tw.HalfFlex>
                        <tw.ResetBtn onClick={clickFacilReset}>되돌리기</tw.ResetBtn>
                        <tw.SetBtn onClick={clickFacilSave}>저장</tw.SetBtn>
                    </tw.HalfFlex>
                </tw.ContentsFlex>

                <tw.ContentsFlex>
                    <tw.HalfCol>
                        <tw.OptionWrap>
                            <tw.Label>주차장</tw.Label>
                            <tw.CheckBox
                                type="checkbox"
                                checked={facilData.carpark === 1}
                                onChange={() => toggleFacilData("carpark")}
                            ></tw.CheckBox>
                        </tw.OptionWrap>

                        <tw.OptionWrap>
                            <tw.Label>식당</tw.Label>
                            <tw.CheckBox
                                type="checkbox"
                                checked={facilData.restaurant === 1}
                                onChange={() => toggleFacilData("restaurant")}
                            ></tw.CheckBox>
                        </tw.OptionWrap>

                        <tw.OptionWrap>
                            <tw.Label>수영장</tw.Label>
                            <tw.CheckBox
                                type="checkbox"
                                checked={facilData.swimming_pool === 1}
                                onChange={() => toggleFacilData("swimming_pool")}
                            ></tw.CheckBox>
                        </tw.OptionWrap>

                        <tw.OptionWrap>
                            <tw.Label>헬스장</tw.Label>
                            <tw.CheckBox
                                type="checkbox"
                                checked={facilData.fitness === 1}
                                onChange={() => toggleFacilData("fitness")}
                            ></tw.CheckBox>
                        </tw.OptionWrap>
                    </tw.HalfCol>

                    <tw.HalfCol>
                        <tw.OptionWrap>
                            <tw.Label>카페</tw.Label>
                            <tw.CheckBox
                                type="checkbox"
                                checked={facilData.cafe === 1}
                                onChange={() => toggleFacilData("cafe")}
                            ></tw.CheckBox>
                        </tw.OptionWrap>

                        <tw.OptionWrap>
                            <tw.Label>편의점</tw.Label>
                            <tw.CheckBox
                                type="checkbox"
                                checked={facilData.convenience_store === 1}
                                onChange={() => toggleFacilData("convenience_store")}
                            ></tw.CheckBox>
                        </tw.OptionWrap>

                        <tw.OptionWrap>
                            <tw.Label>스파</tw.Label>
                            <tw.CheckBox
                                type="checkbox"
                                checked={facilData.spa === 1}
                                onChange={() => toggleFacilData("spa")}
                            ></tw.CheckBox>
                        </tw.OptionWrap>
                    </tw.HalfCol>
                </tw.ContentsFlex>
            </tw.ContentsWrap>
        </tw.Container>
    );
}