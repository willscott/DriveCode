#!/bin/bash

mkdir DriveCode
cp manifest.json *.js *.css *.html DriveCode

mkdir DriveCode/images
cp images/mirror-128.png images/mirror-19.png images/mirror-16.png Drivecode/images
cp -R _locales DriveCode
zip -r DriveCode.zip DriveCode DriveCode/*
rm -r DriveCode
