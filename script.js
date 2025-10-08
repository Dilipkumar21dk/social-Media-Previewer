document.addEventListener('DOMContentLoaded', () => {
const platformPostTypes = {
facebook: ['post','story','reel'],
instagram: ['post','story','reel'],
twitter: ['post'],
linkedin: ['post','story'],
youtube: ['video','shorts'],
tiktok: ['video'],
pinterest: ['pin','story']
};


// Elements
const previewPlatformBtns = Array.from(document.querySelectorAll('.post-platform-buttons .platform-btn'));
const leftPlatformBtns = Array.from(document.querySelectorAll('.social-profile .platform'));
const postTypeBtns = Array.from(document.querySelectorAll('.post-type-btn'));
const liveTextEl = document.getElementById('liveText');
const fileInput = document.getElementById('fileInput');
const uploadedFilesContainer = document.getElementById('uploadedFiles');
const previewLogo = document.getElementById('previewLogo');
const previewPlatformName = document.getElementById('previewPlatformName');
const previewText = document.getElementById('previewText');
const previewBox = document.getElementById('previewBox');
const alertBox = document.getElementById('alertBox');
const previewInteractions = document.getElementById('previewInteractions');
const postTypeInput = document.getElementById('postType');
const morePreviewBtns = Array.from(document.querySelectorAll('.preview-btn'));

let currentPlatform = 'facebook';
let uploadedFilesList = [];

const logoMap = {
    facebook:'asserts/facebook.svg',
    instagram:'asserts/instagram.svg',
    twitter:'asserts/twitter.svg',
    linkedin:'asserts/linked.svg',
    youtube:'asserts/youtube.png',
    tiktok:'asserts/tiktok.svg',
    pinterest:'asserts/pinterest.svg'
};

// Utility: escape HTML
function escapeHtml(text){
    if (!text) return '';
    return text.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}

// Set the active platform UI state (only among visible buttons)
function setActivePlatform(platform){
    previewPlatformBtns.forEach(b => {
        if (b.dataset.platform === platform && b.style.display !== 'none') b.classList.add('active');
        else b.classList.remove('active');
    });
    leftPlatformBtns.forEach(b => {
        if (b.value === platform && b.style.display !== 'none') b.classList.add('active');
        else b.classList.remove('active');
    });
}

// Show/hide post type buttons based on the platform
function updatePostTypes(platform){
    if (!platformPostTypes[platform]) {
        postTypeBtns.forEach(btn => { btn.style.display = 'none'; btn.classList.remove('active'); });
        postTypeInput.value = '';
        return;
    }
    postTypeBtns.forEach(btn => {
        if (platformPostTypes[platform].includes(btn.dataset.type)){
            btn.style.display='inline-flex';
        } else {
            btn.style.display='none';
            btn.classList.remove('active');
        }
    });
    const firstType = platformPostTypes[platform][0];
    if(firstType){
        postTypeBtns.forEach(b => b.classList.remove('active'));
        const firstBtn = document.querySelector(`.post-type-btn[data-type="${firstType}"]`);
        if (firstBtn) {
            firstBtn.classList.add('active');
            postTypeInput.value = firstType;
        } else {
            postTypeInput.value = firstType;
        }
    }
}

function updatePreviewHeader(platform){
    previewLogo.src = logoMap[platform] || '';
    previewPlatformName.textContent = platform ? (platform.charAt(0).toUpperCase()+platform.slice(1)) : '';
}

function showAlert(msg){
    alertBox.style.display='flex';
    alertBox.textContent=msg;
    previewText.style.display='none';
    previewInteractions.style.display='none';
}

function clearAlert(){
    alertBox.style.display='none';
    alertBox.textContent='';
    previewText.style.display='';
    previewInteractions.style.display='';
}

function refreshPreview(){
    previewText.innerHTML='';
    if (liveTextEl && liveTextEl.value) previewText.innerHTML=`<p>${escapeHtml(liveTextEl.value)}</p>`;
    uploadedFilesList.forEach(f=>{
        const elem = f.type.startsWith('image/') ? document.createElement('img') : document.createElement('video');
        elem.src = f.url;
        if (!f.type.startsWith('image/')) elem.controls = true;
        elem.style.maxWidth = '100%';
        elem.style.marginTop = '6px';
        previewText.appendChild(elem);
    });
}

function updateInteractions(platform){
    previewInteractions.innerHTML=''; // clear old buttons
    const btn = (label, imgSrc='')=>{
        const b = document.createElement('button');
        if(imgSrc){
            const img=document.createElement('img');
            img.src=imgSrc;
            img.alt=label;
            b.appendChild(img);
        }
        const span=document.createElement('span');
        span.textContent = label;
        b.appendChild(span);
        previewInteractions.appendChild(b);
    };

    switch(platform){
        case 'facebook':
            btn('Like','interactions/fb_like.svg'); btn('Comment','interactions/fb_comment.svg'); btn('Share','interactions/fb_share.svg');
            break;
        case 'instagram':
            btn('Like','interactions/insta_like.png'); btn('Comment','interactions/fb_comment.svg'); btn('Share','interactions/insta_share.png'); btn('Save','interactions/insta_save.png');
            break;
        case 'twitter':
            btn('Comment','interactions/fb_comment.svg'); btn('Retweet','interactions/twitter_repost.svg'); btn('Like','interactions/insta_like.png'); btn('views','interactions/twitter_views.svg');
            break;
        case 'linkedin':
            btn('Like','interactions/linkedin_like.svg'); btn('Comment','interactions/linkedin_comment.svg'); btn('Repost','interactions/twitter_repost.svg'); btn('Share','interactions/linkedin_share.svg');
            break;
        case 'youtube':
            btn('Like','interactions/youtube_like.png'); btn('Dislike','interactions/youtube_dislike.png'); btn('Share','interactions/youtube_share.png'); btn('Download','interactions/youtube_download.png');
            break;
        case 'tiktok':
            btn('Like','interactions/insta_like.png'); btn('Comment','interactions/fb_comment.svg'); btn('Share','interactions/tik tok_share.png'); btn('Follow','interactions/tik tok_follow.png');
            break;
        case 'pinterest':
            btn('Share','interactions/pinterest_share.png'); btn('More','interactions/pinterest_more.png');
            break;
        default:
            break;
    }
}

// Validation rules and alerts
function validateAndAlert(){
    clearAlert();
    refreshPreview();
    if (!currentPlatform) return true;

    const platform = currentPlatform;
    const type = postTypeInput.value || '';
    const text = (liveTextEl && liveTextEl.value) ? liveTextEl.value : '';
    const images = previewText.querySelectorAll('img').length;
    const videos = previewText.querySelectorAll('video').length;

    if(platform==='twitter' && text.length>280){ showAlert("Twitter posts cannot exceed 280 characters."); return false; }
    if(platform==='twitter' && images>4){ showAlert("Twitter allows max 4 images."); return false; }
    if(platform==='instagram' && (images+videos)>10){ showAlert("Instagram allows max 10 images/videos."); return false; }
    if(platform==='instagram' && type==='reel' && videos!==1){ showAlert("Instagram Reel allows only one video."); return false; }
    if(platform==='facebook' && (images+videos)>10){ showAlert("Facebook allows max 10 images/videos."); return false; }
    if(platform==='facebook' && type==='reel' && videos!==1){ showAlert("Facebook Reel allows only one video."); return false; }
    if(platform==='linkedin' && images>9){ showAlert("LinkedIn allows max 9 images."); return false; }
    if(platform==='linkedin' && type==='story' && (images+videos)!==1){ showAlert("LinkedIn Story allows only one image/video."); return false; }
    if(platform==='youtube' && type==='video' && videos<1){ showAlert("YouTube Video requires a video."); return false; }
    if(platform==='youtube' && type==='shorts' && videos!==1){ showAlert("YouTube Shorts allows only one video."); return false; }
    if(platform==='tiktok' && videos!==1){ showAlert("TikTok allows only one video."); return false; }
    if(platform==='pinterest' && type==='pin' && images<1){ showAlert("Pinterest Pin requires an image."); return false; }

    updateInteractions(platform);
    return true;
}

// Infer platform from button text if data-platform missing (robustness)
function inferPlatformFromText(text){
    if(!text) return null;
    const t = text.toLowerCase();
    if (t.includes('facebook')) return 'facebook';
    if (t.includes('instagram')) return 'instagram';
    if (t.includes('twitter') || t.includes('x')) return 'twitter';
    if (t.includes('linkedin')) return 'linkedin';
    if (t.includes('youtube')) return 'youtube';
    if (t.includes('tiktok')) return 'tiktok';
    if (t.includes('pinterest')) return 'pinterest';
    if (t.includes('all')) return 'all';
    return null;
}

// Filter UI to a single platform (or restore all if platform==='all')
function filterToPlatform(platform){
    if (platform === 'all') {
        leftPlatformBtns.forEach(b => b.style.display = '');
        previewPlatformBtns.forEach(b => b.style.display = '');
    } else {
        leftPlatformBtns.forEach(b => b.style.display = (b.value === platform ? '' : 'none'));
        previewPlatformBtns.forEach(b => b.style.display = (b.dataset.platform === platform ? '' : 'none'));
    }

    // Set currentPlatform if selecting a single platform; if 'all' keep current or set to first visible
    if (platform !== 'all') {
        currentPlatform = platform;
    } else {
        // choose first visible preview button as current
        const firstVisible = previewPlatformBtns.find(b => b.style.display !== 'none');
        currentPlatform = firstVisible ? firstVisible.dataset.platform : null;
    }

    setActivePlatform(currentPlatform);
    if (currentPlatform) {
        updatePostTypes(currentPlatform);
        updatePreviewHeader(currentPlatform);
    } else {
        updatePostTypes('');
        updatePreviewHeader('');
    }
    validateAndAlert();
}

// Event Listeners: top preview platform buttons
previewPlatformBtns.forEach(btn=>{
    btn.addEventListener('click', ()=>{
        if (btn.style.display === 'none') return;
        currentPlatform = btn.dataset.platform;
        setActivePlatform(currentPlatform);
        updatePostTypes(currentPlatform);
        updatePreviewHeader(currentPlatform);
        validateAndAlert();
    });
});

// Event Listeners: left platform buttons
leftPlatformBtns.forEach(btn=>{
    btn.addEventListener('click', ()=>{
        if (btn.style.display === 'none') return;
        currentPlatform = btn.value;
        setActivePlatform(currentPlatform);
        updatePostTypes(currentPlatform);
        updatePreviewHeader(currentPlatform);
        validateAndAlert();
    });
});

// Post type buttons
postTypeBtns.forEach(btn=>{
    btn.addEventListener('click', ()=>{
        postTypeBtns.forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        postTypeInput.value = btn.dataset.type;
        validateAndAlert();
    });
});

// Live text input
if (liveTextEl) {
    liveTextEl.addEventListener('input', () => {
        validateAndAlert();
    });
}

// File upload handling
if (fileInput) {
    fileInput.addEventListener('change', e=>{
        const files = Array.from(e.target.files);
        files.forEach(file=>{
            const url = URL.createObjectURL(file);
            uploadedFilesList.push({file, type: file.type, url});
            const wrapper = document.createElement('div');
            wrapper.classList.add('uploaded-item');
            const elem = file.type.startsWith('image/') ? document.createElement('img') : document.createElement('video');
            elem.src = url;
            if (!file.type.startsWith('image/')) elem.controls = true;
            elem.style.maxWidth = '100px';
            wrapper.appendChild(elem);
            const closeBtn = document.createElement('span');
            closeBtn.textContent = '×';
            closeBtn.classList.add('file-close-btn');
            closeBtn.addEventListener('click', ()=>{
                uploadedFilesList = uploadedFilesList.filter(f => f.url !== url);
                wrapper.remove();
                validateAndAlert();
            });
            wrapper.appendChild(closeBtn);
            uploadedFilesContainer.appendChild(wrapper);
        });
        fileInput.value = '';
        validateAndAlert();
    });
}

// Remove platform button (close 'x')
document.addEventListener('click', e=>{
    if (e.target.classList.contains('close-btn')){
        const btn = e.target.closest('.platform');
        if (!btn) return;
        const platformValue = btn.value;
        // Remove left button
        btn.remove();
        // Remove corresponding preview button
        const previewBtn = document.querySelector(`.post-platform-buttons .platform-btn[data-platform="${platformValue}"]`);
        if (previewBtn) previewBtn.remove();
        // Update arrays
        // (we rebuild arrays to keep them in sync)
        while (previewPlatformBtns.length) previewPlatformBtns.pop();
        previewPlatformBtns.push(...Array.from(document.querySelectorAll('.post-platform-buttons .platform-btn')));
        while (leftPlatformBtns.length) leftPlatformBtns.pop();
        leftPlatformBtns.push(...Array.from(document.querySelectorAll('.social-profile .platform')));
        const first = document.querySelector('.post-platform-buttons .platform-btn');
        if (first) first.click();
        else {
            currentPlatform = null;
            previewText.innerHTML = '';
            previewLogo.src = '';
            previewPlatformName.textContent = '';
        }
    }
});

// More Previews buttons (filter behavior)
morePreviewBtns.forEach(btn=>{
    btn.addEventListener('click', ()=>{
        let platform = btn.dataset.platform;
        if (!platform) platform = inferPlatformFromText(btn.textContent);
        if (!platform) return;
        filterToPlatform(platform);
    });
});

// Initialize UI
setActivePlatform(currentPlatform);
updatePostTypes(currentPlatform);
updatePreviewHeader(currentPlatform);
validateAndAlert();


});


// Live text sync between Social Profile and Post Preview
const liveText = document.getElementById('liveText');
if (liveText) {
    liveText.addEventListener('input', function() {
        const previewBox = document.getElementById('previewBox');
        let p = previewBox.querySelector('p');
        if (!p) {
            p = document.createElement('p');
            previewBox.appendChild(p);
        }
        p.textContent = liveText.value;
        // If text is deleted, also delete in preview
        if (liveText.value.trim() === '') {
            p.textContent = '';
        }
        updatePreview();
    });
    // Initialize preview with default text
    liveText.value = document.querySelector('.preview-box p')?.textContent || '';
    // Sync initial state
    const previewBox = document.getElementById('previewBox');
    let p = previewBox.querySelector('p');
    if (p) p.textContent = liveText.value;
}
