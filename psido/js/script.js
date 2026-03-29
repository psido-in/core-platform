/**
 * PSIDO AGENCY  - MAIN SCRIPT
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Sticky Header Functionality
    const header = document.getElementById('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = menuToggle.querySelector('i');
        if(navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Close menu when clicking a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = menuToggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });

    // 3. Scroll Reveal Animations (Intersection Observer)
    const revealElements = document.querySelectorAll('.reveal-fade-up, .reveal-fade-left, .reveal-fade-right');
    
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('active');
                // Optional: Stop observing once revealed
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // 4. Number Counter Animation for Growth Section
    const counters = document.querySelectorAll('.counter');
    const progressFills = document.querySelectorAll('.progress-fill');
    
    const counterOptions = {
        threshold: 0.5,
        rootMargin: "0px"
    };
    
    const counterObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                
                // Animate Numbers
                counters.forEach(counter => {
                    const updateCount = () => {
                        const target = +counter.getAttribute('data-target');
                        const count = +counter.innerText;
                        
                        // Lower inc means slower animation
                        const inc = target / 50; 
                        
                        if (count < target) {
                            counter.innerText = Math.ceil(count + inc);
                            setTimeout(updateCount, 30);
                        } else {
                            counter.innerText = target;
                        }
                    };
                    updateCount();
                });
                
                // Animate Progress Bars
                progressFills.forEach(fill => {
                    const width = fill.style.width;
                    fill.style.width = '0%'; // Reset explicitly
                    setTimeout(() => {
                        fill.style.width = width;
                    }, 100);
                });
                
                observer.unobserve(entry.target);
            }
        });
    }, counterOptions);
    
    // Observe the growth section container
    const growthSection = document.querySelector('.growth-container');
    if (growthSection) {
        counterObserver.observe(growthSection);
    }
    
    // 5. Advanced Vanilla 3D Tilt Effect for Premium Feel
    const tiltElements = document.querySelectorAll('.tilt-card, .service-card, .price-card');
    
    tiltElements.forEach(el => {
        // Prepare element
        el.style.transformStyle = 'preserve-3d';
        el.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
        
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left; // x position within the element.
            const y = e.clientY - rect.top;  // y position within the element.
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -10; // Max tilt 10deg
            const rotateY = ((x - centerX) / centerX) * 10;
            
            el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        
        el.addEventListener('mouseleave', () => {
            el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            el.style.transition = 'transform 0.5s ease-out';
        });
        
        el.addEventListener('mouseenter', () => {
            el.style.transition = 'none'; // Snappy tracking when mouse is inside
            
            // Reapply base transition shortly after entering so it doesn't snap abruptly from 0 to target
            setTimeout(() => {
                el.style.transition = 'transform 0.1s linear';
            }, 50);
        });
    });

    // 7. ScrollSpy: Update active navigation link on scroll
    const sections = document.querySelectorAll('div[id], section[id]');
    const navItems = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href').includes(current) && current !== '') {
                item.classList.add('active');
            }
        });
        
        // Handle Home specifically
        if (window.scrollY < 200) {
            navItems.forEach(item => {
                if(item.getAttribute('href') === '#' || item.getAttribute('href') === 'index.html') {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
        }
    });

    // 8. Smooth Scroll Offset Fix (since header is fixed)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 6. Scrollytelling SVG Background Animation
    const scrollScene = document.getElementById('scrollScene');
    if (scrollScene) {
        // Elements Act 1
        const sceneLaptop = document.getElementById('scene-laptop');
        const laptopUi = document.getElementById('laptop-ui');
        const code1 = document.getElementById('code-1');
        const code2 = document.getElementById('code-2');
        const code3 = document.getElementById('code-3');
        const code4 = document.getElementById('code-4');

        // Elements Act 2
        const sceneFunnel = document.getElementById('scene-funnel');
        const tp1 = document.getElementById('tp-1');
        const tp2 = document.getElementById('tp-2');
        const tp3 = document.getElementById('tp-3');
        const lp1 = document.getElementById('lp-1');
        const lp2 = document.getElementById('lp-2');
        const lp3 = document.getElementById('lp-3');
        const leadParticles = document.getElementById('lead-particles');

        // Elements Act 3
        const sceneGrowth = document.getElementById('scene-growth');
        const growthLine = document.getElementById('growth-line');
        const rocket = document.getElementById('rocket');
        
        // Caching dimensions
        let maxScroll = 1;
        function updateMaxScroll() {
            maxScroll = Math.max(
                document.body.scrollHeight,
                document.documentElement.scrollHeight
            ) - window.innerHeight;
            if(maxScroll <= 0) maxScroll = 1;
        }
        window.addEventListener('resize', updateMaxScroll);
        updateMaxScroll();

        window.addEventListener('scroll', () => {
            let progress = window.scrollY / maxScroll;
            if(progress < 0) progress = 0;
            if(progress > 1) progress = 1;
            
            // --- ACT 1: 0% to 33% ---
            if (progress <= 0.33) {
                let p1 = progress / 0.33; // Local progress 0 to 1
                
                // Fade out laptop slightly at very end of its sector
                let laptopOp = 1;
                if(p1 > 0.8) laptopOp = 1 - ((p1 - 0.8) * 5);
                sceneLaptop.setAttribute('opacity', laptopOp);
                sceneLaptop.setAttribute('transform', `translate(960, 540) scale(1)`);
                
                // UI fade in
                laptopUi.setAttribute('opacity', p1 * 2 > 1 ? 1 : p1 * 2);
                
                // Fly code in from edges toward laptop
                code1.setAttribute('transform', `translate(${p1 * 400}, ${p1 * 50})`);
                code2.setAttribute('transform', `translate(${-p1 * 300}, ${p1 * 80})`);
                code3.setAttribute('transform', `translate(${p1 * 200}, ${-p1 * 150})`);
                code4.setAttribute('transform', `translate(${-p1 * 100}, ${p1 * 20})`);
                
                sceneFunnel.setAttribute('opacity', 0);
                sceneGrowth.setAttribute('opacity', 0);
                
                // Reset Growth line so it doesn't stay drawn if scrolling up fast
                growthLine.setAttribute('stroke-dashoffset', 2000);
            }
            
            // --- ACT 2: 33% to 66% ---
            else if (progress > 0.33 && progress <= 0.66) {
                let p2 = (progress - 0.33) / 0.33; // 0 to 1
                sceneLaptop.setAttribute('opacity', 0);
                sceneGrowth.setAttribute('opacity', 0);
                growthLine.setAttribute('stroke-dashoffset', 2000); // reset
                
                // Fade in then out
                let funnelOp = p2 < 0.2 ? p2 * 5 : (p2 > 0.8 ? (1 - p2) * 5 : 1);
                sceneFunnel.setAttribute('opacity', funnelOp);
                
                // Subtle scale up
                let scale2 = 0.8 + (p2 * 0.4);
                sceneFunnel.setAttribute('transform', `translate(960, 540) scale(${scale2})`);
                
                // Funnel traffic flow
                tp1.setAttribute('transform', `translate(0, ${p2 * 500})`);
                tp2.setAttribute('transform', `translate(0, ${p2 * 600})`);
                tp3.setAttribute('transform', `translate(0, ${p2 * 450})`);
                
                if (p2 > 0.4) {
                    let leadP = (p2 - 0.4) / 0.6;
                    leadParticles.setAttribute('opacity', leadP * 2 > 1 ? 1 : leadP * 2);
                    lp1.setAttribute('transform', `translate(0, ${leadP * 150})`);
                    lp2.setAttribute('transform', `translate(0, ${leadP * 200})`);
                    lp3.setAttribute('transform', `translate(0, ${leadP * 250})`);
                } else {
                    leadParticles.setAttribute('opacity', 0);
                }
            }
            
            // --- ACT 3: 66% to 100% ---
            else if (progress > 0.66) {
                let p3 = (progress - 0.66) / 0.34; // 0 to 1
                sceneLaptop.setAttribute('opacity', 0);
                sceneFunnel.setAttribute('opacity', 0);
                
                let growthOp = p3 < 0.2 ? p3 * 5 : 1;
                sceneGrowth.setAttribute('opacity', growthOp);
                
                let scale3 = 0.8 + (p3 * 0.2);
                sceneGrowth.setAttribute('transform', `translate(960, 540) scale(${scale3})`);
                
                // Draw growth line rapidly
                let dashOffset = 2500 - (p3 * 2500);
                if (dashOffset < 0) dashOffset = 0;
                growthLine.setAttribute('stroke-dashoffset', dashOffset);
                
                // Rocket follows a general upward right path (approx of the graph)
                let rX = -500 + (p3 * 1000);
                // Math.pow gives it an exponential curve look matching the T path
                let curve = Math.pow(p3, 2); 
                let rY = 350 - (curve * 650);
                
                rocket.setAttribute('transform', `translate(${rX}, ${rY}) rotate(45)`);
            }
        });

        // Trigger initial calculation
        setTimeout(() => window.dispatchEvent(new Event('scroll')), 100);
    }

    // 9. WhatsApp Form Submission
    const enquiryForm = document.getElementById('enquiryForm');
    const formSuccessMessage = document.getElementById('formSuccessMessage');

    if (enquiryForm) {
        enquiryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const requirement = document.getElementById('requirement').value;
            
            // Receiver Phone Number (Assumed from contact info)
            const receiverNumber = '919148547599'; 
            
            // Build the message
            const message = `*New Enquiry from Psido Website*%0A%0A` +
                            `*Name:* ${encodeURIComponent(name)}%0A` +
                            `*Phone:* ${encodeURIComponent(phone)}%0A` +
                            `*Requirement:* %0A${encodeURIComponent(requirement)}`;
            
            // Create WhatsApp URL
            const whatsappUrl = `https://wa.me/${receiverNumber}?text=${message}`;
            
            // Open WhatsApp in new tab
            window.open(whatsappUrl, '_blank');
            
            // UI Feedback: Show success message and hide form
            enquiryForm.style.opacity = '0';
            setTimeout(() => {
                enquiryForm.style.display = 'none';
                formSuccessMessage.style.display = 'block';
                formSuccessMessage.style.opacity = '0';
                setTimeout(() => {
                    formSuccessMessage.style.opacity = '1';
                    formSuccessMessage.style.transition = 'opacity 0.5s ease-in';
                }, 50);
            }, 300);
            
            // Optional: Log submission
            console.log('Form submitted to WhatsApp:', { name, phone, requirement });
        });
    }
});

