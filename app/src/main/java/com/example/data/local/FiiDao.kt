package com.example.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.data.model.CategoryTargetEntity
import com.example.data.model.FiiAssetEntity
import com.example.data.model.PortfolioConfigEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface FiiDao {
    @Query("SELECT * FROM fii_assets ORDER BY isSelected DESC, ticker ASC")
    fun getAllAssets(): Flow<List<FiiAssetEntity>>

    @Query("SELECT * FROM fii_assets ORDER BY isSelected DESC, ticker ASC")
    suspend fun getAllAssetsSync(): List<FiiAssetEntity>

    @Query("SELECT * FROM fii_assets WHERE ticker = :ticker LIMIT 1")
    suspend fun getAsset(ticker: String): FiiAssetEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAsset(asset: FiiAssetEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAssets(assets: List<FiiAssetEntity>)

    @Update
    suspend fun updateAsset(asset: FiiAssetEntity)

    @Query("DELETE FROM fii_assets WHERE ticker = :ticker")
    suspend fun deleteAsset(ticker: String)

    @Query("UPDATE fii_assets SET isLocked = :isLocked WHERE ticker = :ticker")
    suspend fun updateAssetLock(ticker: String, isLocked: Boolean)

    @Query("UPDATE fii_assets SET isPriceUpdated = :isUpdated WHERE ticker = :ticker")
    suspend fun updateAssetPriceStatus(ticker: String, isUpdated: Boolean)

    @Query("SELECT * FROM portfolio_config WHERE id = 1 LIMIT 1")
    fun getPortfolioConfig(): Flow<PortfolioConfigEntity?>

    @Query("SELECT * FROM portfolio_config WHERE id = 1 LIMIT 1")
    suspend fun getPortfolioConfigSync(): PortfolioConfigEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun savePortfolioConfig(config: PortfolioConfigEntity)

    @Query("SELECT * FROM category_targets")
    fun getAllCategoryTargets(): Flow<List<CategoryTargetEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun saveCategoryTargets(targets: List<CategoryTargetEntity>)

    @Query("UPDATE fii_assets SET isSelected = 1")
    suspend fun activateAllAssets()

    @Query("UPDATE fii_assets SET isSelected = :selected")
    suspend fun setAllAssetsSelection(selected: Boolean)

    @Query("DELETE FROM fii_assets")
    suspend fun clearAllAssets()
}
