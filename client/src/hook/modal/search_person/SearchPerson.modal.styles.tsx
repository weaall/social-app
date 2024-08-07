import tw from "tailwind-styled-components"

interface RegBtnProps {
    $validator: boolean
}

export const Container = tw.div`w-full h-full bg-zinc-400/[0.3] fixed top-0 z-50`
export const ModalWrap = tw.div`max-w-[28rem] w-[80%] h-[34rem] flex flex-col rounded-[16px] p-6
bg-white absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]
animate-modal`

export const TitleWrap = tw.div`h-[10%]`

export const Title = tw.h2`font-bold text-2xl text-center`

export const CloseBtn = tw.button`w-8 absolute top-4 right-4 group`
export const CloseSVG = tw.img`h-full w-full group-hover-scale-105`

export const RegWrap = tw.div`h-[10%]`

export const RegBtn = tw.button<RegBtnProps>` 
w-full mx-1 text-lg font-medium px-5 py-3 rounded-xl bg-black text-white
mobile:hover:bg-black
${(p) => (p.$validator ? "bg-black hover:bg-black/[0.8]" : "bg-gray-200")}`

export const InputWrap = tw.div`flex flex-col text-left h-[80%] py-4`

export const ListWrap = tw.div`flex items-center py-4 px-8 justify-between`
export const BtnWrap = tw.div`flex justify-center space-x-3`
export const PlusBtn = tw.button`text-xl font-bold w-6 hover:scale-110`
export const MinusBtn = tw.button`text-xl font-bold w-6 hover:scale-110`
export const BtnSvg = tw.img``
export const Label = tw.label`text-lg font-bold`


