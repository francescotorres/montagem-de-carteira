package com.example.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
import com.example.data.model.CategoryTargetEntity
import com.example.data.model.FiiAssetEntity
import com.example.data.model.PortfolioConfigEntity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@Database(
    entities = [FiiAssetEntity::class, PortfolioConfigEntity::class, CategoryTargetEntity::class],
    version = 2,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun fiiDao(): FiiDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getInstance(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "fii_portfolio_database"
                )
                    .fallbackToDestructiveMigration()
                    .addCallback(object : Callback() {
                        override fun onCreate(db: SupportSQLiteDatabase) {
                            super.onCreate(db)
                            // Populate default data on first creation
                            CoroutineScope(Dispatchers.IO).launch {
                                val dao = getInstance(context).fiiDao()
                                dao.savePortfolioConfig(DefaultData.defaultPortfolioConfig)
                                dao.saveCategoryTargets(DefaultData.defaultCategoryTargets)
                                dao.insertAssets(DefaultData.defaultAssets)
                            }
                        }
                    })
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
