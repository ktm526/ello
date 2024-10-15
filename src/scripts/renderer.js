

let idleTime = 0;
let isNavBarShrunk = false;
let selectedSSID = ''; // 현재 선택된 Wi-Fi 네트워크 이름을 저장할 변수


function toggleNavBar() {
  const navbar = document.querySelector('.navbar');
  isNavBarShrunk = !isNavBarShrunk;
  navbar.classList.toggle('shrink', isNavBarShrunk);
}

// 네비게이션 바 클릭 이벤트 핸들링
document.querySelector('.navbar').addEventListener('click', (e) => {
  // 클릭한 요소가 메뉴 항목(a 태그)일 경우, 네비게이션 바가 접히지 않도록 함
  if (!e.target.closest('a')) {
    toggleNavBar();
  }
});

// 메뉴 클릭 시 활성화 상태를 유지하고, 네비게이션 바가 접히지 않도록 함
function activateMenu(menuId) {
  const navLinks = document.querySelectorAll('.navbar a');
  navLinks.forEach(link => link.classList.remove('active'));
  document.getElementById(menuId).classList.add('active');
}

// 스크린세이버 타이머 리셋 함수
function resetIdleTimer() {
  idleTime = 0;
  document.getElementById('screensaver').style.display = 'none';
}

// 페이지 동적 로드 함수
function loadPage(page) {
  resetIdleTimer();
  console.log(`Loading page: ${page}`); // 페이지 로드 시 확인 로그


  // 모든 네비게이션 링크의 active 클래스 초기화
  const navLinks = document.querySelectorAll('.navbar a');
  navLinks.forEach(link => link.classList.remove('active'));

  // 클릭된 링크에 active 클래스 추가
  const activeLink = Array.from(navLinks).find(link => link.getAttribute('onclick').includes(page));
  if (activeLink) activeLink.classList.add('active');

  // 페이지 로드
  fetch(`pages/${page}`)
    .then(response => response.text())
    .then(html => {
      document.getElementById('content').innerHTML = html;
      console.log(`Page ${page} loaded`); // 페이지가 로드되었는지 확인
      if (page === 'wifi.html') {
        console.log('Loading Wi-Fi list'); // Wi-Fi 목록 로드 시작 확인
        loadWifiList();
      }

      // 페이지에 포함된 스크립트 실행
      const scripts = document.getElementById('content').getElementsByTagName('script');
      for (let script of scripts) {
        eval(script.innerText);
      }
    })
    .catch(err => {
      console.warn('페이지 로드 실패:', err);
    });
}

// Wi-Fi 목록 로드 함수
async function loadWifiList() {
  resetIdleTimer(); // 스크린세이버 타이머 리셋
  console.log('test');

  try {
    const networks = await window.wifiAPI.scan(); // Wi-Fi 목록 가져오기
    console.log('net');
    console.log(networks);
    const wifiList = document.getElementById('wifi-list');
    wifiList.innerHTML = '';

    // Wi-Fi 목록이 없을 경우 메시지 표시
    if (networks.length === 0) {
      wifiList.innerHTML = '<li>Wi-Fi 네트워크를 찾을 수 없습니다.</li>';
      return;
    }

    // Wi-Fi 목록을 quality 값으로 내림차순 정렬
    networks.sort((a, b) => b.quality - a.quality);

    // Wi-Fi 목록 표시
    networks.forEach(network => {
      const li = document.createElement('li');

      // 네트워크 이름을 담는 span 요소 생성
      const networkNameSpan = document.createElement('span');
      networkNameSpan.style.cursor = 'pointer';
      networkNameSpan.textContent = network.ssid; // 네트워크 이름 추가

      // 신호 품질 및 보안 상태를 담는 span 요소 생성
      const qualitySpan = document.createElement('span');
      qualitySpan.classList.add('signal'); // CSS에서 스타일 적용을 위해 클래스 추가
      let qualityText = '';

      if (network.security && network.security !== "") {
        qualityText += '잠김 '; // 보안이 걸려 있으면 '잠김' 표시
      }
      qualityText += `${network.quality}%`; // 신호 품질 추가
      qualitySpan.textContent = qualityText;

      // li 요소에 클릭 이벤트 추가
      li.onclick = () => connectToWifi(network.ssid); // Wi-Fi 네트워크 클릭 시 연결 시도

      // li 요소에 생성한 span 요소들 추가
      li.appendChild(networkNameSpan);
      li.appendChild(qualitySpan);

      wifiList.appendChild(li);
    });
  } catch (error) {
    console.error('Wi-Fi 목록 로드 실패:', error);
  }
}


// Wi-Fi 연결 함수
/*
async function connectToWifi(ssid) {
  const password = prompt(`${ssid}의 비밀번호를 입력하세요:`);

  if (password !== null) {
    try {
      const success = await window.wifiAPI.connect(ssid, password);
      if (success) {
        alert(`${ssid}에 연결되었습니다.`);
      } else {
        alert('연결에 실패했습니다. 비밀번호를 확인하세요.');
      }
    } catch (error) {
      console.error('Wi-Fi 연결 실패:', error);
    }
  }
}*/
function connectToWifi(ssid) {
  selectedSSID = ssid;
  document.getElementById('wifi-modal-ssid').textContent = `네트워크 이름: ${ssid}`;
  document.getElementById('wifi-modal').style.display = 'flex'; // 모달 열기
}
function closeWifiModal() {
  document.getElementById('wifi-modal').style.display = 'none'; // 모달 닫기
}
async function submitWifiPassword() {
  const password = document.getElementById('wifi-password').value;

  if (password) {
    try {
      const success = await window.wifiAPI.connect(selectedSSID, password);
      if (success) {
        alert(`${selectedSSID}에 연결되었습니다.`);
      } else {
        alert('연결에 실패했습니다. 비밀번호를 확인하세요.');
      }
    } catch (error) {
      console.error('Wi-Fi 연결 실패:', error);
    } finally {
      closeWifiModal(); // 모달 닫기
    }
  } else {
    alert('비밀번호를 입력해주세요.');
  }
}

document.querySelectorAll('.navbar a').forEach(link => {
  link.addEventListener('click', () => {
    const icon = link.querySelector('img path');
    if (link.classList.contains('active')) {
      icon.style.fill = 'white'; // 활성화 시 흰색
    } else {
      icon.style.fill = '#555'; // 비활성화 시 회색
    }
  });
});


// 초기 로드 및 설정
window.onload = () => {
  loadPage('wifi.html');
  activateMenu('menu-wifi'); // 초기 활성화 상태 설정
  const wifiModal = document.getElementById('wifi-modal');
  if (wifiModal) {
    wifiModal.style.display = 'none';
  }

  document.body.addEventListener('mousemove', resetIdleTimer);
  document.body.addEventListener('keydown', resetIdleTimer);
  document.body.addEventListener('mousedown', resetIdleTimer);

  setInterval(() => {
    idleTime++;
    if (idleTime >= 10) {
      document.getElementById('screensaver').style.display = 'flex';
    }
  }, 1000);
};
