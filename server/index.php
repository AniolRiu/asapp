<?php
echo '<pre>';
print_r($_POST);
print_r($_FILES);
echo '</pre>';
$tmp_filename=$_FILES['data']['tmp_name'];
rename($tmp_filename,"uploaded_audio.wav");
chmod("uploaded_audio.wav",0755);
?>