const slider = document.querySelectorAll('.slider');
const prvBtn = document.getElementById('prev-btn');
const nxtBtn = document.getElementById('next-btn');

let currentSlide = 0;

function hideSlider(){
    slider.forEach(item=> item.classList.remove('on'));
}
function showSlider(){
    slider[currentSlide].classList.add('on');
}

function nextSlide(){
    hideSlider()
    if(currentSlide === slider.length -1){
        currentSlide = 0
    }else{
        currentSlide++
    }
    showSlider()
}

function prevSlide(){
    hideSlider()
    if(currentSlide ===  0){
        currentSlide = slider.length -1
    }else{
        currentSlide--
    }
    showSlider()
}
nxtBtn.addEventListener('click', nextSlide)
prvBtn.addEventListener('click', prevSlide)


setInterval(nextSlide, 7000);