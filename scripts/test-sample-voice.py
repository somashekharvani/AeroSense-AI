import asyncio
import edge_tts
import os

TEXT = (
    "Imagine an illustrative family scenario — the Sharma family living right here in Bengaluru. "
    "Every morning, they decide whether it is safe to exercise outdoors, how to commute to work, "
    "and whether they should open their apartment windows. "
    "AeroSense AI guides their daily clean-air choices with deterministic physical engines "
    "and auditable Impact Receipts."
)

async def main():
    os.makedirs("demo-video", exist_ok=True)
    out_file = os.path.join("demo-video", "voice_sample_prabhat.mp3")
    communicator = edge_tts.Communicate(TEXT, "en-IN-PrabhatNeural", rate="+0%")
    await communicator.save(out_file)
    print(f"Generated voice sample: {out_file} ({os.path.getsize(out_file)} bytes)")

if __name__ == "__main__":
    asyncio.run(main())
