package services.utils

class NestedMapUtil {
    companion object {
        fun extractString(map: HashMap<*, *>, keys: List<String>): String? =
            extractValue(map, keys) as String?

        fun extractInt(map: HashMap<*, *>, keys: List<String>): Int? =
            extractValue(map, keys) as Int?

        fun extractValue(map: HashMap<*, *>, keys: List<String>): Any? {
            val leadingKey = keys.first()
            val remainingKeys = keys.drop(1)

            return map[leadingKey]?.let {
                if (remainingKeys.isEmpty()) {
                    it
                } else {
                    extractValue(it as HashMap<*, *>, remainingKeys)
                }
            }
        }
    }

}