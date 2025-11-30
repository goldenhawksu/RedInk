"""
持久化配置管理工具
解决Railway容器重启后YAML配置丢失的问题
将API Key等敏感配置保存到history目录(持久化卷)
"""

import yaml
import logging
from pathlib import Path
from typing import Dict, Optional

logger = logging.getLogger(__name__)


class PersistentConfigManager:
    """持久化配置管理器"""

    def __init__(self, project_root: Path):
        """
        初始化配置管理器

        Args:
            project_root: 项目根目录
        """
        self.project_root = project_root
        self.history_dir = project_root / 'history'
        self.persistent_config_path = self.history_dir / 'persistent_config.yaml'

        # 确保history目录存在
        self.history_dir.mkdir(parents=True, exist_ok=True)

    def _load_persistent_config(self) -> Dict:
        """加载持久化配置"""
        try:
            if self.persistent_config_path.exists():
                with open(self.persistent_config_path, 'r', encoding='utf-8') as f:
                    config = yaml.safe_load(f) or {}
                    logger.debug(f"📂 从持久化文件加载配置: {self.persistent_config_path}")
                    return config
        except Exception as e:
            logger.error(f"❌ 读取持久化配置失败: {e}")

        return {}

    def _save_persistent_config(self, config: Dict):
        """保存持久化配置"""
        try:
            with open(self.persistent_config_path, 'w', encoding='utf-8') as f:
                yaml.dump(config, f, allow_unicode=True, default_flow_style=False)
            logger.info(f"✅ 持久化配置已保存: {self.persistent_config_path}")
        except Exception as e:
            logger.error(f"❌ 保存持久化配置失败: {e}")
            raise

    def save_provider_config(self, config_type: str, config_data: Dict):
        """
        保存服务商配置到持久化存储

        Args:
            config_type: 'text' 或 'image'
            config_data: 配置数据(包含providers和active_provider)
        """
        try:
            # 1. 读取现有持久化配置
            persistent_config = self._load_persistent_config()

            # 2. 更新对应类型的配置
            persistent_config[config_type] = config_data

            # 3. 保存到持久化文件
            self._save_persistent_config(persistent_config)

            # 4. 同时保存到项目根目录的YAML文件(供运行时使用)
            runtime_config_file = f"{config_type}_providers.yaml"
            runtime_config_path = self.project_root / runtime_config_file

            with open(runtime_config_path, 'w', encoding='utf-8') as f:
                yaml.dump(config_data, f, allow_unicode=True, default_flow_style=False)

            logger.info(f"✅ {config_type}配置已保存到运行时文件: {runtime_config_path}")

        except Exception as e:
            logger.error(f"❌ 保存{config_type}配置失败: {e}")
            raise

    def load_provider_config(self, config_type: str) -> Optional[Dict]:
        """
        加载服务商配置

        优先从持久化存储读取,如果没有则从运行时YAML读取

        Args:
            config_type: 'text' 或 'image'

        Returns:
            配置字典,如果不存在返回None
        """
        try:
            # 1. 优先从持久化文件读取
            persistent_config = self._load_persistent_config()
            if config_type in persistent_config:
                logger.info(f"✅ 从持久化存储加载{config_type}配置")
                return persistent_config[config_type]

            # 2. 如果持久化文件没有,尝试从运行时YAML读取
            runtime_config_file = f"{config_type}_providers.yaml"
            runtime_config_path = self.project_root / runtime_config_file

            if runtime_config_path.exists():
                with open(runtime_config_path, 'r', encoding='utf-8') as f:
                    config = yaml.safe_load(f) or {}
                    logger.info(f"✅ 从运行时文件加载{config_type}配置: {runtime_config_path}")

                    # 如果API Key不为空,保存到持久化存储(迁移逻辑)
                    providers = config.get('providers', {})
                    has_api_key = any(
                        p.get('api_key') for p in providers.values()
                    )
                    if has_api_key:
                        logger.info(f"🔄 检测到API Key,迁移到持久化存储")
                        self.save_provider_config(config_type, config)

                    return config

        except Exception as e:
            logger.error(f"❌ 加载{config_type}配置失败: {e}")

        return None


# 全局单例
_persistent_config_manager: Optional[PersistentConfigManager] = None


def get_persistent_config_manager() -> PersistentConfigManager:
    """获取持久化配置管理器单例"""
    global _persistent_config_manager

    if _persistent_config_manager is None:
        from pathlib import Path
        project_root = Path(__file__).parent.parent.parent
        _persistent_config_manager = PersistentConfigManager(project_root)

    return _persistent_config_manager
