import $ from 'jquery';
import Swiper from 'swiper'

export default class Slider {
  constructor() {
    this.opt = {
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      slidesPerView: 3,
      spaceBetween: 30,
      slidesPerView: '3',
      breakpoints: {
        1000: {
          slidesPerView: '2',
        },
        640: {
          slidesPerView: '1',
        }
      },
    }

    this.swiper = new Swiper('.swiper-container',this.opt);
  }

}