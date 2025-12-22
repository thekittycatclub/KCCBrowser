let loadProgress = 0;
        const loadingBar = document.getElementById('loadingBar');
        const loadingOverlay = document.getElementById('loadingOverlay');
        const contentIframe = document.getElementById('sj-frame');
        
        const loadInterval = setInterval(() => {
            loadProgress += Math.random() * 30;
            if (loadProgress >= 90) {
                loadProgress = 90;
                clearInterval(loadInterval);
            }
            loadingBar.style.width = loadProgress + '%';
        }, 200);
        
        contentIframe.addEventListener('load', () => {
            loadProgress = 100;
            loadingBar.style.width = '100%';
            
            setTimeout(() => {
                loadingOverlay.style.opacity = '0';
                loadingBar.style.opacity = '0';
                setTimeout(() => {
                    loadingOverlay.style.display = 'none';
                    loadingBar.style.display = 'none';
                }, 300);
            }, 200);
        });
        
        setTimeout(() => {
            if (loadingOverlay.style.display !== 'none') {
                loadProgress = 100;
                loadingBar.style.width = '100%';
                loadingOverlay.style.opacity = '0';
                loadingBar.style.opacity = '0';
                setTimeout(() => {
                    loadingOverlay.style.display = 'none';
                    loadingBar.style.display = 'none';
                }, 300);
            }
        }, 3000);
        
        const contextMenu = document.getElementById('contextMenu');
        
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            
            contextMenu.style.left = `${e.pageX}px`;
            contextMenu.style.top = `${e.pageY}px`;
            contextMenu.classList.remove('hidden');
            contextMenu.classList.add('active');
        });
        
        document.addEventListener('click', () => {
            contextMenu.classList.add('hidden');
            contextMenu.classList.remove('active');
        });
        
        const extensionsBtn = document.getElementById('extensionsBtn');
        const extensionsMenu = document.getElementById('extensionsMenu');
        const settingsBtn = document.getElementById('settingsBtn');
        const settingsMenu = document.getElementById('settingsMenu');
        
        extensionsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            extensionsMenu.classList.toggle('hidden');
            if (!extensionsMenu.classList.contains('hidden')) {
                extensionsMenu.classList.add('active');
            }
            settingsMenu.classList.add('hidden');
            settingsMenu.classList.remove('active');
        });
        
        settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            settingsMenu.classList.toggle('hidden');
            if (!settingsMenu.classList.contains('hidden')) {
                settingsMenu.classList.add('active');
            }
            extensionsMenu.classList.add('hidden');
            extensionsMenu.classList.remove('active');
        });
        
        document.addEventListener('click', () => {
            extensionsMenu.classList.add('hidden');
            extensionsMenu.classList.remove('active');
            settingsMenu.classList.add('hidden');
            settingsMenu.classList.remove('active');
        });