import React, { DragEvent, useEffect, useState } from "react";
import { sendJWT } from "../../../utils/jwtUtils";
import { axiosInstance, handleAxiosError } from "../../../utils/axios.utils";
import { useNavigate } from "react-router-dom";
import { HotelDataInInfo } from "../../../interface/interfaces";

import * as tw from "./HotelInfo.styles";
import Loading from "../../../components/loading/Loading";
import { nanoid } from "nanoid";

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

export default function HotelInfo({ hotel_id }: { hotel_id: string | undefined }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

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

    const fetchImageFile = async () => {
        try {
            const urlResponse = await axiosInstance.get("/hotel/img/" + hotel_id);

            const imagesData = urlResponse.data.data;

            const newFiles = [];
            const imagePreviews = [];

            for (let i = 0; i < imagesData.length; i++) {
                const imageUrl = imagesData[i].url;

                const response = await fetch(imageUrl);
                const blob = await response.blob();

                const urlParts = imageUrl.split(".");
                const fileExtension = urlParts[urlParts.length - 1];

                const file = new File([blob], `image${i + 1}.${fileExtension}`, { type: `image/${fileExtension}` });

                newFiles.push(file);
                imagePreviews.push(URL.createObjectURL(file));
            }

            setFiles(newFiles);
            setImagePreviews(imagePreviews);
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
        const sanitizedValue = name === "tel_num" ? value.replace(/[^0-9]/g, "") : value
        setInfoData({ ...infoData, [name]: sanitizedValue });
    };

    const onChangeSelect = (name: string, e: React.ChangeEvent<HTMLSelectElement>) => {
        const { value } = e.target;
        setInfoData({ ...infoData, [name]: value });
    };

    const onChangeDesk = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setInfoData({ ...infoData, [name]: value });
    };

    const onChangeServ = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const sanitizedValue = name === "breakfast_price" ? value.replace(/[^0-9]/g, "") : value
        setServData({ ...servData, [name]:  sanitizedValue });
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
                url: "/hotel/mgmt/info/" + hotel_id,
            });

            const response = await axiosInstance.request(config);
            const fetchedData = response.data.data[0];
            setHotelData(fetchedData);
            setInfoData(fetchedData);
            setServData(fetchedData);
            setFacilData(fetchedData);
        } catch (error) {
            handleAxiosError(error, navigate);
        } finally {
            setLoading(false);
        }
    };

    const uploadFilesToS3 = async () => {
        const uploadedKeys = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const key = `hotel_img/${hotel_id}/${nanoid(12)}`;
            const contentType = file.type;

            const presignedUrlsResponse = await axiosInstance.post("/auth/presignedUrl", {
                key: key,
                contentType: contentType,
            });

            const presignedUrl = presignedUrlsResponse.data.data;

            await fetch(presignedUrl, {
                method: "PUT",
                body: file,
                headers: {
                    "Content-Type": contentType,
                },
            });

            const imageUrl = presignedUrl.split("?")[0];
            uploadedKeys.push(imageUrl);
        }
        return uploadedKeys;
    };

    const clickInfoSave = async () => {
        try {
            const uploadedKeys = await uploadFilesToS3();

            const updatedHotelData = {
                ...infoData,
                urls: uploadedKeys,
            };

            const config = await sendJWT({
                headers: {
                    "Content-Type": "application/json",
                },
                method: "put",
                url: "/hotel/mgmt/info",
                data: updatedHotelData,
            });

            await axiosInstance.request(config);
            fetchHotelData();
            window.alert("저장완료");
        } catch (error) {
            handleAxiosError(error, navigate);
        }
    };

    const clickInfoReset = () => {
        if (window.confirm("되돌리시겠습니까?")) {
            if (hotelData) {
                setInfoData(hotelData);
                fetchImageFile();
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
                await axiosInstance.request(config);
                window.alert("저장완료");
                fetchHotelData();
            } catch (error) {
                handleAxiosError(error, navigate);
            }
        } else {
        }
    };

    const clickServReset = () => {
        if (window.confirm("되돌리시겠습니까?")) {
            if (hotelData) {
                setServData(hotelData);
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
                await axiosInstance.request(config);
                window.alert("저장완료");
                fetchHotelData();
            } catch (error) {
                handleAxiosError(error, navigate);
            }
        } else {
        }
    };

    const clickFacilReset = () => {
        if (window.confirm("되돌리시겠습니까?")) {
            if (hotelData) {
                setFacilData(hotelData);
            }
        }
    };

    useEffect(() => {
        fetchHotelData();
    }, [hotel_id]);

    if (loading) {
        return <Loading />;
    }

    return (
        <tw.Container>
            <tw.MobileWrap>
                <tw.ContentsWrap>
                    <tw.ContentsFlex>
                        <tw.TitleWrap>
                            <tw.Title>숙소정보</tw.Title>
                        </tw.TitleWrap>
                        <tw.HalfFlex>
                            <tw.ResetBtn onClick={clickInfoReset}>되돌리기</tw.ResetBtn>
                            <tw.SetBtn onClick={clickInfoSave}>저장</tw.SetBtn>
                        </tw.HalfFlex>
                    </tw.ContentsFlex>
                    <tw.ContentsFlex>
                        <tw.OneThirdCol>
                            <tw.OptionWrap>
                                <tw.Label>전화번호</tw.Label>
                                <tw.InputBox value={infoData.tel_num} maxLength={13} name="tel_num" onChange={onChangeInfo}></tw.InputBox>
                            </tw.OptionWrap>

                            <tw.OptionWrap>
                                <tw.Label>체크인</tw.Label>
                                <tw.Select value={infoData.check_in} onChange={(e) => onChangeSelect("check_in", e)}>
                                    {[...Array(24).keys()].map((hour) => (
                                        <option key={hour} value={hour}>
                                            {hour}
                                        </option>
                                    ))}
                                </tw.Select>
                            </tw.OptionWrap>

                            <tw.OptionWrap>
                                <tw.Label>체크아웃</tw.Label>
                                <tw.Select value={infoData.check_out} onChange={(e) => onChangeSelect("check_out", e)}>
                                    {[...Array(24).keys()].map((hour) => (
                                        <option key={hour} value={hour}>
                                            {hour}
                                        </option>
                                    ))}
                                </tw.Select>
                            </tw.OptionWrap>
                        </tw.OneThirdCol>
                        <tw.TwoThirdCol>
                            <tw.Label>숙소설명</tw.Label>
                            <tw.DescInput value={infoData.description} name="description" onChange={onChangeDesk} maxLength={300}></tw.DescInput>
                        </tw.TwoThirdCol>
                    </tw.ContentsFlex>
                    <tw.UploadWrap onDragOver={onDragOver} onDrop={onDrop}>
                        <tw.ImgLabel>이미지를 드래그 앤 드롭하세요.</tw.ImgLabel>
                        <tw.ImgContainer>
                            {imagePreviews.map((preview, index) => (
                                <tw.ImgOutWrap key={index}>
                                    <tw.RemoveBtn onClick={() => removeFile(index)} style={{ marginLeft: "10px" }}>
                                        삭제
                                    </tw.RemoveBtn>
                                    <tw.ImgWrap>
                                        <tw.Img src={preview} alt={`이미지 미리보기 ${index + 1}`} draggable={false} />
                                    </tw.ImgWrap>
                                </tw.ImgOutWrap>
                            ))}
                        </tw.ImgContainer>
                    </tw.UploadWrap>
                </tw.ContentsWrap>

                <tw.ContentsWrap>
                    <tw.ContentsFlex>
                        <tw.TitleWrap>
                            <tw.Title>서비스</tw.Title>
                        </tw.TitleWrap>
                        <tw.HalfFlex>
                            <tw.ResetBtn onClick={clickServReset}>되돌리기</tw.ResetBtn>
                            <tw.SetBtn onClick={clickServSave}>저장</tw.SetBtn>
                        </tw.HalfFlex>
                    </tw.ContentsFlex>

                    <tw.ContentsFlex>
                        <tw.HalfCol>
                            <tw.CheckWrap>
                                <tw.CheckBox type="checkbox" checked={servData.wifi === 1} onChange={() => toggleServData("wifi")}></tw.CheckBox>
                                <tw.Label>와이파이</tw.Label>
                            </tw.CheckWrap>

                            <tw.CheckWrap>
                                <tw.CheckBox type="checkbox" checked={servData.breakfast === 1} onChange={() => toggleServData("breakfast")}></tw.CheckBox>
                                <tw.Label>조식</tw.Label>
                            </tw.CheckWrap>

                            <tw.OptionWrap>
                                <tw.Label>조식금액</tw.Label>
                                <tw.InputBox value={servData.breakfast_price} maxLength={6} name="breakfast_price" onChange={onChangeServ}></tw.InputBox>
                            </tw.OptionWrap>
                        </tw.HalfCol>
                        <tw.HalfCol>
                            <tw.CheckWrap>
                                <tw.CheckBox
                                    type="checkbox"
                                    checked={servData.always_check_in === 1}
                                    onChange={() => toggleServData("always_check_in")}
                                ></tw.CheckBox>
                                <tw.Label>24시 체크인</tw.Label>
                            </tw.CheckWrap>

                            <tw.CheckWrap>
                                <tw.CheckBox type="checkbox" checked={servData.barbecue === 1} onChange={() => toggleServData("barbecue")}></tw.CheckBox>
                                <tw.Label>바베큐</tw.Label>
                            </tw.CheckWrap>
                        </tw.HalfCol>
                    </tw.ContentsFlex>
                </tw.ContentsWrap>

                <tw.ContentsWrap>
                    <tw.ContentsFlex>
                        <tw.TitleWrap>
                            <tw.Title>편의시설</tw.Title>
                        </tw.TitleWrap>
                        <tw.HalfFlex>
                            <tw.ResetBtn onClick={clickFacilReset}>되돌리기</tw.ResetBtn>
                            <tw.SetBtn onClick={clickFacilSave}>저장</tw.SetBtn>
                        </tw.HalfFlex>
                    </tw.ContentsFlex>

                    <tw.ContentsFlex>
                        <tw.HalfCol>
                            <tw.CheckWrap>
                                <tw.CheckBox type="checkbox" checked={facilData.carpark === 1} onChange={() => toggleFacilData("carpark")}></tw.CheckBox>
                                <tw.Label>주차장</tw.Label>
                            </tw.CheckWrap>

                            <tw.CheckWrap>
                                <tw.CheckBox type="checkbox" checked={facilData.restaurant === 1} onChange={() => toggleFacilData("restaurant")}></tw.CheckBox>
                                <tw.Label>식당</tw.Label>
                            </tw.CheckWrap>

                            <tw.CheckWrap>
                                <tw.CheckBox
                                    type="checkbox"
                                    checked={facilData.swimming_pool === 1}
                                    onChange={() => toggleFacilData("swimming_pool")}
                                ></tw.CheckBox>
                                <tw.Label>수영장</tw.Label>
                            </tw.CheckWrap>

                            <tw.CheckWrap>
                                <tw.CheckBox type="checkbox" checked={facilData.fitness === 1} onChange={() => toggleFacilData("fitness")}></tw.CheckBox>
                                <tw.Label>헬스장</tw.Label>
                            </tw.CheckWrap>
                        </tw.HalfCol>

                        <tw.HalfCol>
                            <tw.CheckWrap>
                                <tw.CheckBox type="checkbox" checked={facilData.cafe === 1} onChange={() => toggleFacilData("cafe")}></tw.CheckBox>
                                <tw.Label>카페</tw.Label>
                            </tw.CheckWrap>

                            <tw.CheckWrap>
                                <tw.CheckBox
                                    type="checkbox"
                                    checked={facilData.convenience_store === 1}
                                    onChange={() => toggleFacilData("convenience_store")}
                                ></tw.CheckBox>
                                <tw.Label>편의점</tw.Label>
                            </tw.CheckWrap>

                            <tw.CheckWrap>
                                <tw.CheckBox type="checkbox" checked={facilData.spa === 1} onChange={() => toggleFacilData("spa")}></tw.CheckBox>
                                <tw.Label>스파</tw.Label>
                            </tw.CheckWrap>
                        </tw.HalfCol>
                    </tw.ContentsFlex>
                </tw.ContentsWrap>
            </tw.MobileWrap>
        </tw.Container>
    );
}
