int pirPin = 2;     
int ledPin = 13;    
int pirState = LOW;   
int lastPirState = LOW;
int motionCount = 0;

void setup() {
  pinMode(pirPin, INPUT);
  pinMode(ledPin, OUTPUT);
  Serial.begin(115200);  // Must match ESP32
  Serial.println("PIR Sensor ready...");
}

void loop() {
  pirState = digitalRead(pirPin);

  // Detect rising edge (person just entered)
  if (pirState == HIGH && lastPirState == LOW) {
    motionCount++;
    digitalWrite(ledPin, HIGH);

    // Build simple JSON string
    String jsonData = "{\"motion\": true, \"count\": " + String(motionCount) + ", \"sectionName\": \"Computer Science\"}";
    Serial.println(jsonData);  // Send JSON to ESP32

    Serial.print("Person entered! Count = ");
    Serial.println(motionCount);
  }

  // Detect falling edge (person left)
  if (pirState == LOW && lastPirState == HIGH) {
    digitalWrite(ledPin, LOW);
  }

  lastPirState = pirState; // Save current state
  delay(100);  // Small delay for stability
}
