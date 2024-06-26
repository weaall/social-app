import tw from "tailwind-styled-components";

interface MenuOpenProps {
    $validator: boolean
}

export const Container = tw.div`max-w-[840px] relative`

export const MenuWrap = tw.div<MenuOpenProps>`max-w-[420px] absolute top-[4.04rem] right-0 w-[50%] h-auto z-50
bg-white/[0.95] flex flex-col rounded-3xl border-b shadow-lg
transition ease-in duration-200 overflow-hidden
mobile:w-[100%] mobile:ml-[0%] mobile:max-w-[840px]
${(p) => (p.$validator ? "opacity-1" : "opacity-0 pointer-events-none")}`

export const MenuLabelWrap = tw.div`flex justify-between`
export const MenuLabel = tw.div`py-3 px-6 text-sm text-red-400`

export const MenuNav = tw.nav`py-2 px-2`
export const MenuUl = tw.ul`text-center py-2 mx-6 space-y-1`
export const MenuLi = tw.li`py-2 rounded-md
transition ease-in delay-50 hover:cursor-pointer hover:bg-main/[0.1] hover:text-main`
export const MenuA = tw.a``

export const SignOutBtn = tw.button`mr-3 py-1 px-4 border border-main rounded-xl 
transition ease-in delay-50 hover:bg-main hover:text-white`