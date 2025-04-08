import HeroImage from "./images/hero.svg";
import Hero1 from "./images/imgDog.jpg";
import Hero2 from "./images/hero2.svg";
import Hero3 from "./images/imgDog2.jpg";
import Dog from "./images/dog.svg";
import DogBG from "./images/dog-bg.svg";
import WhatWeDo from "./images/what-we-do.svg";
import Therapy from "./images/therapy.svg";
import Clock from "./images/clock.svg";
import Update from "./images/update.svg";
import Medical from "./images/medical.svg";
import Donations from "./images/donations.svg";
import { useDispatch } from "react-redux";
import { isSuccess } from "../store/authSlice";
import cardsOne from "./images/cardsOne.svg";
import cardsTwo from "./images/cardsTwo.svg";
import Ankit from "./images/ankit-dp.jpg";
import Akshat from "./images/akshat-dp.jpg";
import Sahil from "./images/sahil-dp.jpg";
import Vikas from "./images/vikas-dp.jpg";

const styledLink = {
    textDecoration: 'none',
    color: '#72635D',
    cursor: 'pointer',
    padding: '0 5px',
}
const logoLinkStyle = {
    textDecoration: 'none',
    cursor: 'pointer',
    color: "#000000",
    fontSize: "2 rem"
}
const navbarButtonStyle = {
    textDecoration: 'none',
    cursor: 'pointer',
    color: "#000000",
    fontWeight: "500",
}
const footerButtonStyle = {
    textDecoration: 'none',
    cursor: 'pointer',
    color: "white",
    fontWeight: "300",
}
const footerSpecialButtonStyle = {
    textDecoration: 'none',
    cursor: 'pointer',
    color: "white",
    fontWeight: "500",
}
const loginTypeButtonUser = {
    textDecoration: 'none',
    cursor: 'pointer',
    backgroundColor: "#F2C94C",
    color: "black",
    padding: "8px",
    borderRadius: "4px",
    width: "75px",
    fontSize: "larger"
}
const loginTypeButtonNgo = {
    textDecoration: 'none',
    cursor: 'pointer',
    backgroundColor: "#918079",
    color: "black",
    padding: "8px",
    borderRadius: "4px",
    width: "75px",
    fontSize: "larger"
}


function Success() {
    const dispatch = useDispatch();
    const handleClick = () => {
        dispatch(isSuccess({
            success: false
        }))
    }

    return (
        <div className="success-container">
            <h3 className="success-heading">Thank You for reporting!</h3>
            <button className="success-report-button" onClick={handleClick}>Report Again</button>
        </div>
    )
}

export { styledLink, logoLinkStyle, navbarButtonStyle, footerButtonStyle, footerSpecialButtonStyle, HeroImage, Hero1, Hero2, Hero3, Dog, DogBG, WhatWeDo, Clock, Update, Medical, Therapy, Donations, loginTypeButtonNgo, loginTypeButtonUser, Success ,cardsOne,cardsTwo,Ankit,Akshat,Vikas,Sahil}