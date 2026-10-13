#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include "DHTesp.h"

const char* ssid = "Wokwi-GUEST";
const char* password = "";

const char* mqtt_server = "broker.qubitro.com";
const int mqtt_port = 1883;
const char* mqtt_user = "705342ff-0c1a-4dcc-9dd3-dcfa4c1ffb3e";
const char* mqtt_password = "TOKEN_DO_DISPOSITIVO_QUBITRO";  // credencial do dispositivo, copiada do painel do Qubitro
const char* mqtt_topic = "sensor/dados";
const char* client_id = "705342ff-0c1a-4dcc-9dd3-dcfa4c1ffb3e";

#define DHT_PIN 15
DHTesp dht;

WiFiClient espClient;
PubSubClient client(espClient);

unsigned long lastMsg = 0;
const long interval = 5000;

void setup_wifi() {
  Serial.print("Conectando a ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi conectado");
  Serial.println("IP: ");
  Serial.println(WiFi.localIP());

  dht.setup(DHT_PIN, DHTesp::DHT22);
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Conectando ao MQTT...");
    if (client.connect(client_id, mqtt_user, mqtt_password)) {
      Serial.println("Conectado!");
    } else {
      Serial.print("Falhou, rc=");
      Serial.print(client.state());
      Serial.println(" tentando novamente em 5 segundos...");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  unsigned long now = millis();
  if (now - lastMsg > interval) {
    lastMsg = now;

    TempAndHumidity tempH = dht.getTempAndHumidity();
    const int length = 450;

    // BLOCO 1
    StaticJsonDocument<length> doc1;
    doc1["sensor_tanque_PH"] = 1.5;
    doc1["sensor_tanque_TEMP"] = 15;
    doc1["sensor_plantacao_1_PH"] = 8;
    doc1["sensor_plantacao_1_HUM"] = 1.4;
    doc1["sensor_plantacao_2_PH"] = 7;
    doc1["sensor_plantacao_2_HUM"] = 1.7;

    char buffer1[length];
    serializeJson(doc1, buffer1);
    Serial.print("Publicando BLOCO 1: ");
    Serial.println(buffer1);
    client.publish(mqtt_topic, buffer1); 
    
    delay (2000);

    // BLOCO 2
    StaticJsonDocument<length> doc2;
    doc2["sensor_plantacao_3_PH"] = 9;
    doc2["sensor_plantacao_3_HUM"] = 1.8;
    doc2["sensor_plantacao_4_PH"] = 5;
    doc2["sensor_plantacao_4_HUM"] = 1.2;

    char buffer2[length];
    serializeJson(doc2, buffer2);
    Serial.print("Publicando BLOCO 2: ");
    Serial.println(buffer2);
    client.publish(mqtt_topic, buffer2);
  }
}
