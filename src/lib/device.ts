export function getDeviceInfo() {
  const userAgent = navigator.userAgent;
  let platform = 'web';
  let deviceModel = 'Unknown';

  if (/iPhone|iPad|iPod/.test(userAgent)) {
    platform = 'ios';
    const match = userAgent.match(/iPhone|iPad|iPod/);
    deviceModel = match ? match[0] : 'iOS Device';
  } else if (/Android/.test(userAgent)) {
    platform = 'android';
    const match = userAgent.match(/Android\s([\d.]+)/);
    deviceModel = match ? `Android ${match[1]}` : 'Android Device';
  }

  // Get device ID from localStorage or generate one
  let deviceId = localStorage.getItem('device-id');
  if (!deviceId) {
    deviceId = `device-${Date.now()}`;
    localStorage.setItem('device-id', deviceId);
  }

  return {
    platform,
    deviceModel,
    appVersion: '1.0.0', // This could come from package.json or env
    deviceId,
  };
}
