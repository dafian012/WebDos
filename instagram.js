// =============================================
// DAFIANTOOLS — INSTAGRAM DOWNLOADER
// =============================================

async function processInstagram() {
    const urlInput = document.getElementById('instagramUrl');
    const url = urlInput.value.trim();
    const loader = document.getElementById('igLoader');
    const btnText = document.querySelector('.ig-btn .btn-text');
    const loadingOverlay = document.getElementById('igLoadingOverlay');
    const loadingText = document.getElementById('igLoadingText');
    const resultSection = document.getElementById('igResultSection');

    if (!url) {
        shakeElement(urlInput);
        return;
    }

    // Show loading
    loader.style.display = 'block';
    btnText.style.display = 'none';
    loadingOverlay.style.display = 'flex';
    loadingText.textContent = '🔍 Menganalisis link Instagram...';

    try {
        // Call external Instagram API (gunakan API publik)
        const apiUrl = `https://api.dafiantools.my.id/api/instagram?url=${encodeURIComponent(url)}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        loadingText.textContent = '📥 Menyiapkan media...';

        if (data.status === 'success' && data.data) {
            const mediaData = data.data;
            
            // Show preview
            const igPreview = document.getElementById('igPreview');
            if (mediaData.type === 'video' || mediaData.type === 'reel') {
                igPreview.innerHTML = `
                    <video controls autoplay muted loop>
                        <source src="${mediaData.url}" type="video/mp4">
                    </video>
                `;
            } else {
                igPreview.innerHTML = `
                    <img src="${mediaData.url}" alt="Instagram Media" style="width:100%;max-height:500px;object-fit:contain;">
                `;
            }

            // Show info
            const mediaInfo = document.getElementById('igMediaInfo');
            mediaInfo.innerHTML = `
                <div style="display:flex;flex-direction:column;gap:5px;">
                    <span>📸 <strong>${mediaData.type?.toUpperCase() || 'Media'}</strong></span>
                    <span>❤️ Likes: ${formatNumber(mediaData.likes || 0)}</span>
                    <span>💬 Comments: ${formatNumber(mediaData.comments || 0)}</span>
                </div>
            `;

            // Store data for download
            window._igData = {
                url: mediaData.url,
                type: mediaData.type,
                thumbnail: mediaData.thumbnail,
                mediaList: mediaData.media_list || [],
                owner: mediaData.owner
            };

            // Show result
            resultSection.style.display = 'block';
            resultSection.scrollIntoView({ behavior: 'smooth' });

            loadingText.textContent = '✅ Selesai!';
        } else {
            throw new Error('Media tidak ditemukan atau akun private');
        }
    } catch (error) {
        loadingText.textContent = '❌ Gagal memproses link';
        alert('Error: ' + error.message + '\n\nPastikan link Instagram valid dan akun tidak private.');
    } finally {
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
            loader.style.display = 'none';
            btnText.style.display = 'inline';
            loadingText.textContent = 'Mengambil data...';
        }, 800);
    }
}

function downloadIG(type) {
    const data = window._igData;
    if (!data) return;

    let url;
    let filename;

    switch(type) {
        case 'photo':
            url = data.url;
            filename = `instagram_photo_${Date.now()}.jpg`;
            break;
        case 'gallery':
            if (data.mediaList && data.mediaList.length > 0) {
                data.mediaList.forEach((media, i) => {
                    setTimeout(() => {
                        downloadFileIG(media.url, `instagram_gallery_${i+1}_${Date.now()}.jpg`);
                    }, i * 500);
                });
                return;
            }
            alert('Bukan postingan galeri!');
            return;
        case 'story':
            url = data.url;
            filename = `instagram_story_${Date.now()}.mp4`;
            break;
        case 'reels':
            url = data.url;
            filename = `instagram_reels_${Date.now()}.mp4`;
            break;
        case 'video':
            url = data.url;
            filename = `instagram_video_${Date.now()}.mp4`;
            break;
        default:
            return;
    }

    if (url) {
        downloadFileIG(url, filename);
    }
}

function downloadFileIG(url, filename) {
    showToastIG(`⬇️ Mendownload ${filename}...`);

    fetch(url)
        .then(res => res.blob())
        .then(blob => {
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);
            showToastIG('✅ Download selesai!');
        })
        .catch(() => {
            window.open(url, '_blank');
            showToastIG('⚠️ Dibuka di tab baru');
        });
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
}

function shakeElement(el) {
    el.style.animation = 'none';
    el.offsetHeight;
    el.style.animation = 'shake 0.5s ease';
    el.style.borderColor = 'var(--danger)';
    setTimeout(() => {
        el.style.borderColor = 'var(--border)';
    }, 1000);
}

function showToastIG(message) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--surface);
        color: var(--text);
        padding: 12px 24px;
        border-radius: 50px;
        font-weight: 600;
        font-size: 0.9rem;
        z-index: 9999;
        border: 1px solid var(--border);
        box-shadow: 0 10px 30px rgba(0,0,0,0.4);
        animation: slideUp 0.3s ease, fadeIn 0.3s ease;
        pointer-events: none;
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = '0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}