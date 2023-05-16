#! /bin/sh

uvicorn src.controller.main:app --ws auto --host 0.0.0.0
