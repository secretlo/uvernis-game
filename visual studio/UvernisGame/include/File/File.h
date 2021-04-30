#pragma once

#include <iostream>
#include <string>
#include <fstream>
#include <sstream>

#include <json/json.hpp>
using json = nlohmann::json;


#ifdef _WIN32

// File::pwd Windows
#include <Windows.h>

#else

// File::pwd Linux
#include <libgen.h>         // dirname
#include <unistd.h>         // readlink
#include <linux/limits.h>   // PATH_MAX

#endif


class File {
public:
   std::string abspath;

   static std::string pwd();

   static std::string Read(std::string path);
   static void Write(std::string path, std::string data);
   static json ReadJson(std::string path);
   static void WriteJson(std::string path, json data);
   
   static int indent;

   File(std::string abspathToFile);

   std::string read();
   void write(const std::string& data);
   json readJson();
   void writeJson(json data);

   bool exists();
   
   void update(std::function<std::string(std::string)> callback);
   void updateJson(std::function<void(json*)> callback);

   void updateChilds(std::string childProp, std::string childVal, std::function<void(json&)> callback);
   void updateChilds(std::string childProp, size_t childVal, std::function<void(json&)> callback);
   void updateChilds(std::function<bool(json&)> predicate, std::function<void(json&)> callback);
   void forEach(std::function<void(json&)> callback);
   void pushChild(json child);
   void deleteChild(std::string childProp, std::string childVal);
};

#include "File.cpp"