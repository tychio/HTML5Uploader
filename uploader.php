<?php
    header('Content-type: text/json');
    print_r($_FILES["upload"]["name"]);
    $rtn = array(
        "code" => 0,
        "data" => ''
    );
    if ($_FILES["upload"]["error"] > 0) {
        $rtn["code"] = -1;
    } else {
        $rtn["data"] = array(
            "name" => $_FILES["upload"]["name"],
            "type" => $_FILES["upload"]["type"],
            "size" => $_FILES["upload"]["size"],
            "path" => ""
        );
        if (file_exists("img/".$rtn["data"]["name"])) {
            $rtn["code"] = 1;
        } else {
            move_uploaded_file($_FILES["upload"]["tmp_name"],
                "img/".$_FILES["upload"]["name"]);
            $rtn["code"] = 0;
            $rtn["data"]["path"] = "img/".$rtn["data"]["name"];
        }
    }
    echo json_encode($rtn);
?>