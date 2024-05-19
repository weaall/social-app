import React, { useState } from "react";
import * as tw from "./imgslider.styles";

interface Image {
    url: string;
}

interface CustomImageSliderProps {
    images: Image[];
}

export default function ImgSlider({ images }: CustomImageSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const prevSlide = () => {
        const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const nextSlide = () => {
        const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };

    return (
        <tw.ImgContainer>
            <tw.ImgButton onClick={prevSlide} className="left-2">
                {"<"}
            </tw.ImgButton>
            {images[currentIndex]?.url ? (
                <img
                    src={images[currentIndex].url}
                    className="w-full h-full object-cover"
                    alt={`Slide ${currentIndex}`}
                    loading="lazy"
                />
            ) : (
                <tw.UnRegWrap>미등록</tw.UnRegWrap>
            )}
            <tw.ImgButton onClick={nextSlide} className="right-2">
                {">"}
            </tw.ImgButton>
            <tw.DotsContainer>
                {images.map((_, index) => (
                    <tw.Dot key={index} active={index === currentIndex} onClick={() => setCurrentIndex(index)} />
                ))}
            </tw.DotsContainer>
        </tw.ImgContainer>
    );
}
