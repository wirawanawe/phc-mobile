# Custom CMakeLists.txt to handle duplicate targets
cmake_minimum_required(VERSION 3.22.1)

# Set policy to handle duplicate targets
cmake_policy(SET CMP0002 NEW)

# Include the main CMakeLists.txt
include(${CMAKE_CURRENT_SOURCE_DIR}/../../../../../../node_modules/react-native/ReactAndroid/cmake-utils/default-app-setup/CMakeLists.txt)
