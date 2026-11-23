Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.Rate = 0
$synth.Volume = 100
$synth.SetOutputToWaveFile("demo-video/test-speech.wav")
$synth.Speak("Welcome to AeroSense AI. Know the air. Predict the risk. Protect your family. Prove the impact.")
$synth.Dispose()
Write-Host "Audio test file generated: demo-video/test-speech.wav"
