import gsap from "gsap";
import Swup from 'swup';
import SwupJsPlugin from '@swup/js-plugin';

const options = [
    {
      from: '(.*)',
      to: '(.*)',
      in: function(next) {
        document.querySelector('#swup').style.opacity = 0;
        gsap.to(document.querySelector('#swup'), 0.2, {
          opacity: 1,
          onComplete: next
        });
      },
      out: (next) => {
        document.querySelector('#swup').style.opacity = 1;
        gsap.to(document.querySelector('#swup'), 0.2, {
          opacity: 0,
          onComplete: next
        });
      }
    },
    {
        from: '/about/',
        to: '/',
        in: function(next) {
          document.querySelector('#swup').style.opacity = 0;
          gsap.to(document.querySelector('#swup'), 0.5, {
            opacity: 1,
            onComplete: next
          });
        },
        out: (next) => {
          document.querySelector('#swup').style.opacity = 1;
          gsap.to(document.querySelector('#swup'), 0.5, {
            opacity: 0,
            onComplete: next
          });
        }
      }
  ];

const swup = new Swup({
    plugins: [new SwupJsPlugin(options)]
});

swup.on('clickLink', (e)=>{
    let nextUrl = e.target.href.replace(document.location.origin, '');
    let currentUrl = window.location.href.replace(document.location.origin, '')

    let nextFR = nextUrl.startsWith('/fr/');
    let currentFR = currentUrl.startsWith('/fr/');

    if(nextFR != currentFR){
        window.location.href = nextUrl;
    }
    
})