document.addEventListener('DOMContentLoaded', function() {
    // Subtle animation for corner circles
    anime({
        targets: '.corner-circle-top',
        scale: [1, 1.05],
        rotate: [0, 3],
        duration: 8000,
        easing: 'easeInOutSine',
        direction: 'alternate',
        loop: true
    });
    
    anime({
        targets: '.corner-circle-bottom',
        scale: [1, 1.08],
        rotate: [0, -3],
        duration: 9000,
        easing: 'easeInOutSine',
        direction: 'alternate',
        loop: true
    });
    
    // Logo animation
    anime({
        targets: '.logo-container',
        opacity: [0, 1],
        scale: [0.8, 1],
        duration: 1200,
        easing: 'easeOutExpo',
        delay: 300
    });
    
    // Static logo - just make it visible
    anime({
        targets: '.logo',
        opacity: 1,
        duration: 100
    });
    
    // Looping typing animation for welcome title
    const typingTitle = document.getElementById('typing-title');
    const textToType = 'Welcome';
    let isDeleting = false;
    let charIndex = 0;
    let typingSpeed = 150;
    let pauseEnd = 1500;
    
    // Start the typing animation after logo appears
    setTimeout(() => {
        function typeText() {
            // Set typing speed based on action
            typingSpeed = isDeleting ? 50 : 120;
            
            // Typing or deleting logic
            if (!isDeleting && charIndex < textToType.length) {
                // Typing
                typingTitle.textContent += textToType.charAt(charIndex);
                charIndex++;
                
                // When we reach the end of text, pause then start deleting
                if (charIndex === textToType.length) {
                    isDeleting = true;
                    typingSpeed = pauseEnd; // Pause at the end
                }
            } else if (isDeleting && charIndex > 0) {
                // Deleting
                typingTitle.textContent = textToType.substring(0, charIndex - 1);
                charIndex--;
                
                // When deletion is complete, start typing again
                if (charIndex === 0) {
                    isDeleting = false;
                    typingSpeed = 800; // Pause before retyping
                }
            }
            
            // Continue the loop
            setTimeout(typeText, typingSpeed);
        }
        
        // Start the typing animation
        typeText();
    }, 800); // Delay before typing starts
    
    // Subtitle animation
    anime({
        targets: '.welcome-subtitle',
        opacity: [0, 1],
        translateY: [15, 0],
        duration: 1200,
        easing: 'easeOutExpo',
        delay: 1000
    });
    
    // Spice icons removed as requested
    
    // Button animation
    anime({
        targets: '.button-container',
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 1200,
        easing: 'easeOutExpo',
        delay: 1500
    });
    
    // Button bounce animation
    anime({
        targets: '.login-button',
        translateY: [0, -8, 0],
        duration: 1800,
        delay: 2000,
        loop: true,
        easing: 'easeInOutQuad'
    });
    
    // Button hover effect
    const loginButton = document.querySelector('.login-button');
    loginButton.addEventListener('mouseenter', function() {
        anime.remove(this);
        anime({
            targets: this,
            scale: 1.05,
            backgroundColor: 'rgba(255, 255, 255, 1)', // White
            duration: 300,
            easing: 'easeOutQuad'
        });
    });
    
    loginButton.addEventListener('mouseleave', function() {
        anime.remove(this);
        anime({
            targets: this,
            scale: 1,
            backgroundColor: 'rgba(139, 197, 63, 1)', // Lime
            duration: 300,
            easing: 'easeOutQuad'
        });
    });
    
    // Redirect to login page when button is clicked
    if (loginButton) {
        loginButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // First animate everything out
            anime({
                targets: ['.logo-container', '.welcome-text', '.button-container'],
                opacity: 0,
                translateY: -30,
                duration: 800,
                easing: 'easeOutExpo',
                delay: anime.stagger(100),
                complete: function() {
                    // Then fade out the body
                    anime({
                        targets: 'body',
                        opacity: 0,
                        duration: 500,
                        easing: 'easeOutQuad',
                        complete: function() {
                            window.location.href = loginButton.getAttribute('href');
                        }
                    });
                }
            });
        });
    }
});