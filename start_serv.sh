#! /bin/sh

uvicorn src.controller.main:app --ws auto
