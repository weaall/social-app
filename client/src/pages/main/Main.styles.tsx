import tw from "tailwind-styled-components"

export const Container = tw.div`flex flex-col items-center rounded-[32px] bg-gray-100 py-10`

export const ContentsWrap = tw.div`w-full flex flex-col space-y-2 px-6 py-6 border-b`
export const ContentsFlex = tw.div`w-auto flex items-center`
export const HalfCol = tw.div`w-[50%] flex flex-col`
export const HalfFlex = tw.div`w-[50%] flex justify-end`

export const MainContainer = tw.div`w-full`

export const SelectContainer = tw.div`mx-10 rounded-md h-24 bg-white shadow-md`
export const SelectContainerCell1 = tw.div`flex items-center border-b border-gray-300 h-1/2`
export const SelectContainerCell2 = tw.div`flex h-1/2`
export const SelectRegion = tw.div `w-full mx-4 flex ml-2`
export const SelectStartDate = tw.div`w-1/2 h-full border-r border-gray-300 ml-2 flex items-center`
export const SelectEndDate = tw.div`w-1/2 h-full ml-2 flex items-center`

export const SortContainer = tw.div`my-10 mx-[10%] rounded-md h-14 bg-white flex text-xl font-semibold cursor-pointer text-center items-center`
export const SortBtn = tw.button` w-1/2 h-full border-r border-gray-300`
export const FilterBtn = tw.button` w-1/2 h-full`

export const HotelList = tw.div``

export const HotelWrap = tw.div`w-auto my-4 mx-10 rounded-2xl bg-white shadow-md group cursor-pointer hover:shadow-xl`
export const HotelPic = tw.div`w-4/12 h-full rounded-l-2xl rounded-tl-2xl bg-gray-200`
export const HotelInfo = tw.div`w-8/12 relative px-5 py-3 space-y-1`
export const HotelName = tw.h2`text-xl font-bold`
export const HotelAddress = tw.p`text-xs font-bold text-main pl-1`
export const AddressSVG = tw.img`w-3`
export const HotelP = tw.p`text-xs`
export const HotelComp = tw.p`text-xs bg-gray-100 py-1 px-2 rounded-lg`

export const HotelRoom = tw.div`flex h-12 border-t`

export const HotelServWrap = tw.div`flex flex-col py-1 peer/serv`
export const HotelServList = tw.div`flex pt-1 space-x-2 truncate`
export const TooltipServ = tw.div`absolute flex flex-wrap bottom-[65%] mx-3 p-3 h-auto w-auto bg-black opacity-0 scale-0 rounded-xl
peer-hover/serv:opacity-100 peer-hover/serv:scale-100 
transition-opacity duration-300`

export const HotelFacilWrap = tw.div`flex flex-col py-1 peer/facil`
export const HotelFacilList = tw.div`flex pt-1 space-x-2 truncate`
export const TooltipFacil = tw.div`absolute flex flex-wrap bottom-[35%] mx-3 p-3 h-auto w-auto bg-black opacity-0 scale-0 rounded-xl
peer-hover/facil:opacity-100 peer-hover/facil:scale-100 
transition-opacity duration-300`

export const ToolTipText = tw.li`px-3 text-white text-sm font-bold`