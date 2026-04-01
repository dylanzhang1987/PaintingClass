#!/bin/sh
if [ -z "$husky_skip_init" ]; then
  debug darwin=false uname_s="$(uname -s)"
  case "$uname_s" in
  Darwin*) debug "darwin=true; mac=true;" ;;
  esac

  readonly debug="${debug:-false}"
  readonly mac="${mac:-false}"

  export readonly husky_skip_init=1
  sh -e "$0" "$@"
  exitCode="$?"

  if [ $exitCode != 0 ]; then
    echo "husky - command failed with exit code ($exitCode)"
  fi

  exit $exitCode
fi
