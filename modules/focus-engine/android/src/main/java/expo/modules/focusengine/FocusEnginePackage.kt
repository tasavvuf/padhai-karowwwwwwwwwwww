package expo.modules.focusengine

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.Package

class FocusEnginePackage : Package() {
  override fun createModules(): List<Module> = listOf(FocusEngineModule())
}
