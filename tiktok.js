// =============================================
// DAFIANTOOLS — TIKTOK DOWNLOADER
// =============================================

async function processTikTok() {
    const urlInput = document.getElementById('tiktokUrl');
    const url = urlInput.value.trim();
    const loader = document.getElementById('loader');
    const btnText = document.querySelector('.btn-text');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    const resultSection = document.getElementById('resultSection');

    if (!url) {
        shakeElement(urlInput);
        return;
    }

    // Show loading
    loader.style.display = 'block';
    btnText.style.display = 'none';
    loadingOverlay.style.display = 'flex';
    loadingText.textContent = '🔍 Menganalisis link TikTok...';

    try {
        // Call external TikTok API (gunakan API publik)
        const apiUrl = `https://tikwm.com/api/?url=${encodeURIComponent(url)}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        loadingText.textContent = '📥 Menyiapkan video...';

        if (data.code === 0 && data.data) {
            const videoData = data.data;
            
            // Show preview
            const videoPreview = document.getElementById('videoPreview');
            videoPreview.innerHTML = `
                <video controls autoplay muted loop>
                    <source src="${videoData.play}" type="video/mp4">
                    Browser kamu tidak mendukung video tag.
                </video>
            `;

            // Show info
            const videoInfo = document.getElementById('videoInfo');
            videoInfo.innerHTML = `
                <div style="display:flex;flex-direction:column;gap:5px;">
                    <span>🎵 <strong>${videoData.title || 'TikTok Video'}</strong></span>
                    <span>👤 Author: ${videoData.author?.nickname || 'Unknown'}</span>
                    <span>▶️ Plays: ${formatNumber(videoData.play_count || 0)}</span>
                    <span>❤️ Likes: ${formatNumber(videoData.digg_count || 0)}</span>
                </div>
            `;

            // Store data for download
            window._tiktokData = {
                video: videoData.play,
                wm: videoData.wmplay,
                music: videoData.music,
                images: videoData.images || [],
                author: videoData.author,
                cover: videoData.cover
            };

            // Show result
            resultSection.style.display = 'block';
            resultSection.scrollIntoView({ behavior: 'smooth' });

            loadingText.textContent = '✅ Selesai!';
        } else {
            throw new Error('Video tidak ditemukan atau link tidak valid');
        }
    } catch (error) {
        loadingText.textContent = '❌ Gagal memproses link';
        alert('Error: ' + error.message + '\n\nPastikan link TikTok valid dan video tidak private.');
    } finally {
        // Hide loading
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
            loader.style.display = 'none';
            btnText.style.display = 'inline';
            loadingText.textContent = 'Mengambil data...';
        }, 800);
    }
}

function downloadMedia(type) {
    const data = window._tiktokData;
    if (!data) return;

    let url;
    let filename;

    switch(type) {
        case 'video':
            url = data.video;
            filename = `tiktok_video_${Date.now()}.mp4`;
            break;
        case 'slide':
            if (data.images && data.images.length > 0) {
                // Download all images as zip or individually
                data.images.forEach((img, i) => {
                    setTimeout(() => {
                        downloadFile(img, `tiktok_slide_${i+1}_${Date.now()}.jpg`);
                    }, i * 500);
                });
                return;
            }
            alert('Ini bukan video slide!');
            return;
        case 'mp3':
            url = data.music;
            filename = `tiktok_music_${Date.now()}.mp3`;
            break;
        case 'story':
            url = data.video;
            filename = `tiktok_story_${Date.now()}.mp4`;
            break;
        case 'profile':
            if (data.author?.avatar) {
                url = data.author.avatar;
                filename = `tiktok_profile_${data.author.unique_id}_${Date.now()}.jpeg`;
            } else {
                alert('Foto profil tidak tersedia');
                return;
            }
            break;
        case 'thumbnail':
            url = data.cover;
            filename = `tiktok_thumb_${Date.now()}.jpg`;
            break;
        default:
            return;
    }

    if (url) {
        downloadFile(url, filename);
    }
}

function downloadFile(url, filename) {
    // Show download toast
    showToast(`⬇️ Mendownload ${filename}...`);

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
            showToast('✅ Download selesai!');
        })
        .catch(() => {
            // Fallback: langsung buka di tab baru
            window.open(url, '_blank');
            showToast('⚠️ Dibuka di tab baru');
        });
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

function shakeElement(el) {
    el.style.animation = 'none';
    el.offsetHeight; // reflow
    el.style.animation = 'shake 0.5s ease';
    el.style.borderColor = 'var(--danger)';
    setTimeout(() => {
        el.style.borderColor = 'var(--border)';
    }, 1000);
}

function showToast(message) {
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

// Add shake animation
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-8px); }
        50% { transform: translateX(8px); }
        75% { transform: translateX(-4px); }
    }
`;
document.head.appendChild(shakeStyle);