import tw from "tailwind-styled-components";

export const Container = tw.div`flex flex-col items-center`;

export const ContentsFlex = tw.div`h-auto w-auto flex flex-wrap items-center`;

export const MainContainer = tw.div`w-full h-full pb-10`;
export const ContentsWrap = tw.div``

export const SearchWrap = tw.div`mobile:hidden sticky top-0 z-10`;
export const SearchWrapMobile = tw.div`hidden mobile:block sticky top-0 z-50`;

export const HotelWrap = tw.div`flex flex-col items-center space-y-4 my-2 mx-6 mobile:mx-2`;
export const HotelPic = tw.div`w-full h-96 rounded-2xl mobile:h-60`;

export const HotelPicLoading = tw.div`px-6 w-full h-96 rounded-2xl 
mobile:h-60 mobile:px-4
bg-gradient-to-r from-darkGray via-midGray to-lightGray bg-300% animate-gradient`
export const HotelFlexWrapLoading = tw.div`w-full h-36 rounded-xl mobile:mx-0.5
bg-gradient-to-r from-darkGray via-midGray to-lightGray bg-300% animate-gradient`

export const HotelInfoWrap = tw.div`w-full space-y-2`;
export const HotelFlexWrap = tw.div`flex flex-col w-auto p-4 border space-y-2 rounded-xl
mobile:mx-0.5`;
export const HotelInnerWrap = tw.div`flex w-full justify-between`;
export const HotelRating = tw.p`text-lg text-white bg-black rounded-xl px-3 py-1 font-semibold
mobile:text-lg`;
export const HotelTitle = tw.p`text-2xl font-semibold truncate`;
export const HotelAddressWrap = tw.div`flex items-start`;
export const HotelAddress = tw.p`text-main text-sm pl-1 hover:cursor-pointer`;
export const AddressSVG = tw.img`w-4 mt-0.5`;
export const HotelDesc = tw.p`border-t mt-2 pt-2 text-sm text-gray-400`;

export const Label = tw.p`text-xl font-semibold`;
export const HotelServ = tw.div`flex flex-wrap`;
export const HotelTextWrap = tw.div`flex items-center h-auto w-1/5
mobile:w-1/3`;
export const HotelText = tw.p`text-sm
mobile:text-xs`;
export const HotelSvg = tw.img`w-4 mr-1`;

export const RoomList = tw.div`flex flex-col gap-6 mx-6 px-4 py-6
mobile:mx-0 mobile:border-none`;

export const RoomWrap = tw.div`w-full rounded-2xl bg-white shadow-md h-60 border
mobile:flex mobile:flex-col mobile:h-auto`;
export const RoomPic = tw.div`w-4/12 h-60 bg-gray-30
mobile:h-40 mobile:w-full`;

export const RoomInfoWrap = tw.div`flex flex-col w-8/12 py-2 h-60
mobile:w-full mobile:h-auto`;
export const RoomInfo = tw.div`flex relative px-5 py-3 space-y-1 justify-between h-full
mobile:flex-row`;
export const InfoWrap = tw.div`
mobile:w-3/5`;
export const RoomDetailWrap = tw.div`flex flex-col py-3`
export const RoomDetail = tw.div`flex items-center py-0.5`
export const RoomSvg = tw.img`w-5 mr-2`
export const RoomName = tw.h2`text-xl font-semibold truncate
mobile:text-sm`;
export const RoomText = tw.p`text-sm
mobile:text-xs`;

export const PriceWrap = tw.div`flex flex-col text-end self-end
mobile:w-2/5 mobile:itmes-bottom`;
export const TotalLabel = tw.p`text-xs text-gray-400`;
export const TotalPrice = tw.p`text-xl text-red-500 font-bold
mobile:text-xl`;

export const BookBtnWrap = tw.div`text-end`;
export const BookBtn = tw.button`mt-2 text-lg font-medium px-5 py-2 rounded-xl bg-black text-white hover:bg-black/[0.8]
mobile:hover:bg-black`;

export const ReviewContainer = tw.div`flex flex-col mx-6 px-4 py-6
mobile:mx-0`;
export const FlexWrap = tw.div`flex items-center justify-between pb-4`;
export const MoreReviewBtn = tw.button`w-auto self-end text-gray-500 text-base`;
export const NoReview = tw.div`h-20 w-full text-sm flex justify-center items-center`
export const ReviewList = tw.div`flex gap-3 my-2
mobile:p-0 mobile:m-0 mobile:flex-col`;
export const ReviewWrap = tw.div`flex flex-col w-1/3 bg-gray-100/[0.5] p-3 rounded-xl
mobile:w-full`;
export const Rating = tw.span`text-3xl font-semibold pr-4`;
export const TextWrap = tw.div`h-32`;
export const Review = tw.p`px-2 text-sm truncate-on-overflow`;
export const Name = tw.p`text-end pt-4 text-xs`;
export const Date = tw.p`pb-1 text-gray-400 text-xs`;
