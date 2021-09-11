package services.utils

import java.time.OffsetDateTime
import java.util.*

class NestedMapUtil {
    companion object {
        private fun extractMap(map: Map<*,*>, key: String): Map<*,*>? =
            extractValue(map, listOf(key)) as? Map<*, *>

        fun extractDetails(map: Map<*,*>, key:String): Details? =
            extractMap(map, key)?.let{Details(it)}

        fun extractString(map: Map<*, *>, key: String): String? =
            extractValue(map, listOf(key)) as? String

        fun extractString(map: Map<*, *>, keys: List<String>): String? =
            extractValue(map, keys) as? String

        fun extractInt(map: Map<*, *>, keys: List<String>): Int? =
            extractValue(map, keys) as? Int

        fun extractInt(map: Map<*, *>, key: String): Int? =
            extractValue(map, listOf(key)) as? Int

        fun extractUUID(map: Map<*, *>, key: String): UUID? =
            extractString(map, key)?.let{ UUID.fromString(it)}

        fun extractOffsetDateTime(map: Map<*, *>, key: String): OffsetDateTime? =
            extractString(map, key)?.let{ OffsetDateTime.parse(it) }

        fun extractValue(map: Map<*, *>, keys: List<String>): Any? {
            val leadingKey = keys.first()
            val remainingKeys = keys.drop(1)

            return map[leadingKey]?.let {
                if (remainingKeys.isEmpty()) {
                    it
                } else {
                    extractValue(it as Map<*, *>, remainingKeys)
                }
            }
        }
    }

}