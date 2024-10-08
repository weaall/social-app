import tw from "tailwind-styled-components";

interface Closing {
    $isClosing: boolean;
}

interface UnderTagProps {
  $valid: boolean;
}

export const Container = tw.div<Closing>`
  w-full h-full inset-0 bg-black bg-opacity-30 fixed top-0 z-100
  backdrop-blur-sm
  ${(p) => (p.$isClosing ? "animate-closeBackdrop" : "animate-backdrop")}
`;

export const ModalWrap = tw.div<Closing>`
  max-w-[28rem] w-auto h-auto flex flex-col rounded-[16px] p-6
  bg-white absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]
  ${(p) => (p.$isClosing ? "animate-closeModal" : "animate-modal")}
`;

export const ContentsWrap = tw.div`flex flex-col items-center px-4`;

export const Message = tw.p`font-medium text-base text-center py-4 pb-6 truncate`;

export const Input = tw.input`w-[70%] py-2 mb-4 text-xl px-4 border rounded-xl text-center`
export const UnderTag = tw.label<UnderTagProps>`w-auto text-center text-red-500 text-sm
${(p) => (p.$valid ? "text-white" : "text-red-500")}`

export const BtnWrap = tw.div`flex space-x-2`;
export const ConfirmBtn = tw.button` 
w-20 mx-1 text-sm font-medium px-5 py-3 rounded-xl bg-black text-white hover:bg-black/[0.8]
mobile:hover:bg-black`;
export const CancelBtn = tw.button` 
w-20 mx-1 text-sm font-medium px-5 py-3 rounded-xl bg-white text-black hover:bg-gray-100 border border-gray-100
mobile:hover:bg-black`;
