<?php
echo '<pre>';
print_r($_POST);
print_r($_FILES);
echo '</pre>';
unlink("uploaded_audio.wav");
$tmp_filename=$_FILES['data']['tmp_name'];
rename($tmp_filename,"uploaded_audio.wav");
chmod("uploaded_audio.wav",0755);


# Includes the autoloader for libraries installed with composer
require __DIR__ . '/vendor/autoload.php';

# Imports the Google Cloud client library
use Google\Cloud\Speech\SpeechClient;
// if(file_exists("uploaded_audio.wav")) {
	// echo si;
// }
// else {
	// echo no;
// }

# Your Google Cloud Platform project ID
$projectId = 'aim-solo-148914724128';

# Instantiates a client
$speech = new SpeechClient([
    'projectId' => $projectId,
    'languageCode' => 'ca-ES',
]);

# The name of the audio file to transcribe
$fileName = 'uploaded_audio.wav';

# The audio file's encoding and sample rate
$options = [
    'encoding' => 'LINEAR16',
    'sampleRateHertz' => 48000,
];

# Detects speech in the audio file
$results = $speech->recognize(fopen($fileName, 'r'), $options);
print_r($results);
echo 'Transcription: ' . $results[0]['transcript'];

?>