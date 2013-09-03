<?php
    // print_r($_FILES["images"]);
    for ($i = 0; $i < count($_FILES["images"]["error"]); $i++) { 
        echo "No.".$i;
        if ($_FILES["images"]["error"][$i] > 0) {
            echo "<p>Error: " . $_FILES["images"]["error"][$i] . "<p/>";
        } else {
            echo "<p>Upload: " . $_FILES["images"]["name"][$i] . "<p/>";
            echo "<p>Type: " . $_FILES["images"]["type"][$i] . "<p/>";
            echo "<p>Size: " . ($_FILES["images"]["size"][$i] / 1024) . " Kb<p/>";
            if (file_exists("img/" . $_FILES["images"]["name"][$i])) {
                echo $_FILES["images"]["name"][$i] . " already exists. ";
            } else {
                move_uploaded_file($_FILES["images"]["tmp_name"][$i],
                    "img/" . $_FILES["images"]["name"][$i]);
                echo "Stored in: " . "img/" . $_FILES["images"]["name"][$i];
            }
            echo "<hr/>";
        }
    }
?>