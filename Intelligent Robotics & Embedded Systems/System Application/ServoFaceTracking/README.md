# FaceLocking

Face recognition with optional MQTT pan tracking for an ESP8266 servo-mounted camera.

## Documentation

Full documentation is available in the [docs/](docs/) directory:
- [README.md](docs/README.md) - Quick start guide
- [TEST_GUIDE.md](docs/TEST_GUIDE.md) - Step-by-step testing
- [PROJECT_GUIDE.md](docs/PROJECT_GUIDE.md) - Project overview

## Quick Start

```bash
# Setup
bash setup/setup.sh
source .venv/bin/activate

# Download models
python scripts/download_model.py

# Enroll faces
python -m src.enroll

# Run recognition
python -m src.recognize

# Run with MQTT tracking
python track.py
```

## Project Structure

```
FaceLocking/
├── src/                    # Core recognition and tracking modules
├── scripts/                # Utility scripts (download, test, verify)
├── setup/                  # Installation scripts
├── docs/                   # Documentation
├── arduino/                # ESP8266 firmware
├── dashboard/              # Web dashboard UI
├── data/                   # Enrolled faces and activity logs
├── models/                 # AI models (ArcFace, MediaPipe)
└── track.py                # Main entry point for tracking
```

## Testing

Run the verification script to check project integrity:

```bash
python scripts/verify.py
```
