// src/scripts/wifi.js

async function loadWifiList() {
    const networks = await window.wifiAPI.scan();
    const wifiList = document.getElementById('wifi-list');
    wifiList.innerHTML = '';
  
    networks.forEach(network => {
      const li = document.createElement('li');
      li.textContent = `${network.ssid} (${network.signalLevel}%)`;
      li.style.cursor = 'pointer';
      li.onclick = () => connectToWifi(network.ssid);
      wifiList.appendChild(li);
    });
  }
  
  async function connectToWifi(ssid) {
    const password = prompt(`${ssid}의 비밀번호를 입력하세요:`);
  
    if (password !== null) {
      const success = await window.wifiAPI.connect(ssid, password);
      if (success) {
        alert(`${ssid}에 연결되었습니다.`);
      } else {
        alert('연결에 실패했습니다. 비밀번호를 확인하세요.');
      }
    }
  }
  
  window.onload = loadWifiList;
  