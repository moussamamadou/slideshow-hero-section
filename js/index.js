const body = document.querySelector("body");
body.classList.add("hidden");

document.addEventListener("DOMContentLoaded", function() {

    const body = document.querySelector("body");
    body.classList.remove("hidden");

    // Register GSAP plugin
    gsap.registerPlugin(Observer);
    // DOM Elements
    const slideshow = {
        container: document.querySelector('[data-slideshow="container"]'),
        slides: document.querySelectorAll('[data-slideshow="slide"]'),
        images: document.querySelectorAll('[data-slideshow="slide-image"]'),
        allContent: document.querySelectorAll(
            `[data-slideshow="slide-content-image"],
            [data-slideshow="slide-content-text"]`
        )
    };

    slideshow.container.classList.add("overflow-hidden");
    // Initialize state
    const state = {
        currentIndex: -1,
        isAnimating: false
    };
    // Organize slide content into groups
    const getSlidesContent = () => {
        const content = [];
        let groupIndex = 0;
        content[groupIndex] = [];

        slideshow.allContent.forEach((item, index) => {
        content[groupIndex].push(item);
        if ((index + 1) % 2 === 0) {
            groupIndex++;
            content[groupIndex] = [];
        }
        });
        return content;
    };

    const slidesContent = getSlidesContent();
    // Initial slide setup
    const initializeSlides = () => {
        gsap.set(slideshow.slides, { yPercent: 100, position: "absolute" });
        gsap.set(slideshow.slides[0], { yPercent: 0 });
    };

    // Utility functions
    const wrapIndex = (index) => (index + slideshow.slides.length) % slideshow.slides.length;

    // Animation configurations
    const animations = {
        slideUp: (currentSlide, nextSlide, nextIndex) => {

            const timeline = gsap.timeline({
                defaults: { duration: 1.5, ease: "power2.out" },
                onComplete: () => state.isAnimating = false
            });

            if(currentSlide){
                gsap.set(currentSlide, { zIndex: 2, position: "absolute" });
                
                timeline
                    .to(currentSlide, {
                    yPercent: -100,
                    duration: 1.5,
                    ease: "power2.inOut"
                    }, 0)
            }
             
            if(nextSlide) {
                gsap.set(nextSlide, {
                    zIndex: 1,
                    position: "absolute",
                    yPercent: state.currentIndex === -1 ? 100 : 30
                });

                timeline.to(nextSlide, {
                    yPercent: 0,
                    ease: "power2.inOut"
                    }, 0)
                    .from(slideshow.images[nextIndex], {
                    yPercent: 10,
                    scale: 1.25,
                    duration: 2,
                    ease: "power2.inOut"
                    }, 0)
                    .from(slidesContent[nextIndex], {
                    yPercent: 175,
                    stagger: 0.1,
                    duration: 1.75,
                    ease: "power2.out"
                    }, 0.25)
                    .set(slideshow.slides, { zIndex: 0 })
                    .set(nextSlide, { zIndex: 1 });
            }
            return timeline;
        },

        slideDown: (currentSlide, nextSlide, nextIndex) => {
            const timeline = gsap.timeline({
                defaults: { duration: 1.5, ease: "power2.out" },
                onComplete: () => state.isAnimating = false
            });

            if(currentSlide) {  
                gsap.set(currentSlide, { zIndex: 1, yPercent: 0 });
                timeline
                    .to(currentSlide, {
                    yPercent: 15,
                    duration: 2,
                    ease: "power2.inOut"
                    }, 0)
            }
                
            if(nextSlide)  {
                gsap.set(nextSlide, { zIndex: 2, yPercent: -100 });
                timeline.to(nextSlide, {
                    yPercent: 0,
                    ease: "power2.inOut"
                    }, 0)
                    .from(slideshow.images[nextIndex], {
                    yPercent: -10,
                    scale: 1.25,
                    duration: 2,
                    ease: "power2.inOut"
                    }, 0)
                    .from(slidesContent[nextIndex], {
                    yPercent: -150,
                    stagger: 0.1,
                    duration: 1.75,
                    ease: "power3.out"
                    }, "<0.5")
                    .set(slideshow.slides, { zIndex: 0 })
                    .set(nextSlide, { zIndex: 1 });
                }
            return timeline;
        }
    };
    // Main slide transition function
    const goToSlide = (nextSlideIndex, direction) => {
        if (state.isAnimating) return;

        state.isAnimating = true;
        
        nextSlideIndex = wrapIndex(nextSlideIndex);
        const currentSlide = slideshow.slides[state.currentIndex];
        const nextSlide = slideshow.slides[nextSlideIndex];

        if (direction > 0) {
            animations.slideUp(currentSlide, nextSlide, nextSlideIndex);
        } else {
            animations.slideDown(currentSlide, nextSlide, nextSlideIndex);
        }
        state.currentIndex = nextSlideIndex;
    };

    // Initialize slideshow
    const initializeSlideshow = () => {
        initializeSlides();
        Observer.create({
        target: slideshow.container,
        type: "wheel,touch,pointer",
        wheelSpeed: -1,
        onDown: () => !state.isAnimating && goToSlide(state.currentIndex - 1, -1),
        onUp: () => !state.isAnimating && goToSlide(state.currentIndex + 1, 1),
        tolerance: 10,
        preventDefault: true,
        ignoreMobileScrolling: true
        });
        goToSlide(0, 1);
        history.scrollRestoration = "manual";
    };

    // Start the slideshow
    initializeSlideshow();
})