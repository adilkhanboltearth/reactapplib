Pod::Spec.new do |s|
  s.name         = "BoltEarthReactNativeSdk"
  s.version      = "1.0.0"
  s.summary      = "Bolt Earth React Native SDK (iOS)"
  s.description  = "React Native bridge to BoltEarthUiSdkCore."
  s.homepage     = "https://bolt.earth"
  s.license      = { :type => "MIT" }
  s.author       = { "BoltEarth" => "support@bolt.earth" }
  s.platform     = :ios, "15.1"

  s.source       = { :git => "https://github.com/adilkhanboltearth/reactapplib.git", :tag => "v#{s.version}" }

  s.source_files = "ios/**/*.{swift,m,h}"
  s.dependency "React-Core"
  s.dependency "BoltEarthUiSdkCore"
  s.swift_version = "5.0"
  s.static_framework = false
end
