import { RowDataPacket } from "mysql2/promise";

export interface getSearchRows extends RowDataPacket {
    hotel_id: string;
    name: string;
    postcode: number;
    address: string;
    address_detail: string;
    description: string;

    hotel_img: {
        url: string;
    }[]

    wifi: number;
    always_check_in: number;
    breakfast: number;
    barbecue: number;

    carpark: number;
    restaurant: number;
    cafe: number;
    swimming_pool: number;
    spa: number;
    fitness: number;
    convenience_store: number;

    room_id: string;
    room_name: string;
    room_num: number;
    discount: number;

    room_price: {
        room_id: number;
        date: string;
        price: number;
        room_current: number;
        room_limit: number;
    }[];
}

export interface getSearchData{
    hotel_id: string
    name: string
    postcode: number
    address: string
    address_detail: string
    description: string

    wifi: number
    always_check_in: number
    breakfast: number
    barbecue: number

    carpark: number
    restaurant: number
    cafe: number
    swimming_pool: number
    spa: number
    fitness: number
    convenience_store: number

    room_id: number
    room_name: string
    room_num: number
    discount: number

    room_price: {
        name: string;
        price: number;
        room_current: number;
        room_limit: number;
    }[];
}

export interface priceFilter{
    room_price: {
        name: string;
        price: number;
        room_current: number;
        room_limit: number;
    }[];
}

export interface getHotelRows extends RowDataPacket {
    id: string;
    name: string;
    postcode: number;
    address: string;
    address_detail: string;
    description: string;

    hotel_img: {
        url: string;
    }[];

    wifi: number;
    always_check_in: number;
    breakfast: number;
    barbecue: number;

    carpark: number;
    restaurant: number;
    cafe: number;
    swimming_pool: number;
    spa: number;
    fitness: number;
    convenience_store: number;

    room: {
        id: string;
        name: string;
        bed_type: number;
        room_type: number;

        img: {
            url: string;
        }[]

        price:{
            room_id: number;
            date: string;
            price: number;
            room_current: number;
            room_limit: number;
        }[]
    }[];

}

export interface BookingRefRows extends RowDataPacket {
    booking_id: string,
    user_id: string,
    hotel_id: string,
    room_id: string,
    total_price: number,
    check_in: string,
    check_out: string,
    date: string,
}

export interface BookingRows extends RowDataPacket {
    booking_id: string,
    hotel_id: string,
    room_id: string,
    total_price: number,
    check_in: string,
    check_out: string,
    date: string,
}
