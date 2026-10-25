/*
  NANCY AI — 6 External Buttons  (ESP32 ya NodeMCU/ESP8266)

  Library (Arduino Library Manager se):
    "WebSockets" by Markus Sattler  (arduinoWebSockets)

  Kaise kaam karta hai:
    Button dabao -> ESP32 WebSocket (port 81) par {"btn":N} bhejta hai
    -> Nancy AI app (Hardware Hub se ws://<ESP-IP>:81/ connect) -> function chalta hai.

  Button wiring: ek pin GPIO se, doosra pin GND se (INPUT_PULLUP use hota hai).

    btn 1  VOICE    ON/OFF
    btn 2  MIC      ON/OFF
    btn 3  AUTO AI  ON/OFF
    btn 4  MODE     Vision -> Face -> OCR -> Gesture
    btn 5  SOS      emergency (dobara dabane par band)
    btn 6  ALL      saare AI modes ON/OFF
*/

#if defined(ESP8266)
  #include <ESP8266WiFi.h>
#else
  #include <WiFi.h>
#endif
#include <WebSocketsServer.h>

// ====== APNA WiFi YAHAN ======
const char* WIFI_SSID = "YOUR_WIFI_NAME";
const char* WIFI_PASS = "YOUR_WIFI_PASSWORD";

// ====== PINS ======
struct Button {
  uint8_t  pin;
  uint8_t  id;          // JSON me {"btn":id}
  const char* name;
  bool     stable;      // debounce ke baad ki state (true = released)
  bool     lastRead;
  uint32_t changedAt;
};

#if defined(ESP8266)
  // NodeMCU: D1, D2, D5, D6, D7, D3  (D3 = GPIO0 -> board ON karte time ye button na dabaye rakho)
  Button buttons[] = {
    { 5,  1, "VOICE",  true, true, 0 },
    { 4,  2, "MIC",    true, true, 0 },
    { 14, 3, "AUTO",   true, true, 0 },
    { 12, 4, "MODE",   true, true, 0 },
    { 13, 5, "SOS",    true, true, 0 },
    { 0,  6, "ALL",    true, true, 0 },
  };
#else
  // ESP32
  Button buttons[] = {
    { 13, 1, "VOICE",  true, true, 0 },
    { 14, 2, "MIC",    true, true, 0 },
    { 27, 3, "AUTO",   true, true, 0 },
    { 26, 4, "MODE",   true, true, 0 },
    { 25, 5, "SOS",    true, true, 0 },
    { 33, 6, "ALL",    true, true, 0 },
  };
#endif

const uint8_t  BUTTON_COUNT = sizeof(buttons) / sizeof(buttons[0]);
const uint32_t DEBOUNCE_MS  = 40;

WebSocketsServer ws(81);   // Nancy AI app yahin connect karta hai: ws://<IP>:81/

void onWsEvent(uint8_t num, WStype_t type, uint8_t* payload, size_t length) {
  if (type == WStype_CONNECTED) {
    Serial.printf("[WS] app connected (client %u)\n", num);
  } else if (type == WStype_DISCONNECTED) {
    Serial.printf("[WS] app disconnected (client %u)\n", num);
  }
}

void sendPress(const Button& b) {
  char msg[24];
  snprintf(msg, sizeof(msg), "{\"btn\":%u}", b.id);
  ws.broadcastTXT(msg);
  Serial.printf("[BTN] %s -> %s\n", b.name, msg);
}

void connectWifi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("WiFi connecting");
  while (WiFi.status() != WL_CONNECTED) {
    delay(400);
    Serial.print(".");
  }
  Serial.print("\nConnected. IP (ye Nancy AI Hardware Hub me daalo): ");
  Serial.println(WiFi.localIP());
}

void setup() {
  Serial.begin(115200);
  for (uint8_t i = 0; i < BUTTON_COUNT; i++) {
    pinMode(buttons[i].pin, INPUT_PULLUP);
  }
  connectWifi();
  ws.begin();
  ws.onEvent(onWsEvent);
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectWifi();
  }
  ws.loop();

  uint32_t now = millis();
  for (uint8_t i = 0; i < BUTTON_COUNT; i++) {
    Button& b = buttons[i];
    bool reading = digitalRead(b.pin);          // HIGH = released, LOW = pressed

    if (reading != b.lastRead) {
      b.lastRead = reading;
      b.changedAt = now;
    }
    if ((now - b.changedAt) > DEBOUNCE_MS && reading != b.stable) {
      b.stable = reading;
      if (b.stable == LOW) {                    // sirf press par ek baar bhejo
        sendPress(b);
      }
    }
  }
}
