"""
设备绑定管理工具
负责API Key与设备的绑定、验证和过期管理
"""

import yaml
import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)


class DeviceBinding:
    """设备绑定管理器"""

    # 配置常量
    MAX_DEVICES_PER_KEY = 5  # 每个API Key最多绑定5个设备
    BINDING_DURATION_HOURS = 24  # 绑定有效期24小时

    def __init__(self, config_path: Path):
        """
        初始化设备绑定管理器

        Args:
            config_path: 配置文件路径(text_providers.yaml 或 image_providers.yaml)
        """
        self.config_path = config_path
        self.config = self._load_config()

    def _load_config(self) -> dict:
        """加载配置文件"""
        try:
            if not self.config_path.exists():
                logger.warning(f"配置文件不存在: {self.config_path}")
                return {'active_provider': 'default', 'providers': {}}

            with open(self.config_path, 'r', encoding='utf-8') as f:
                config = yaml.safe_load(f) or {}
                return config
        except Exception as e:
            logger.error(f"读取配置文件失败: {e}")
            return {'active_provider': 'default', 'providers': {}}

    def _save_config(self):
        """保存配置文件"""
        try:
            self.config_path.parent.mkdir(parents=True, exist_ok=True)
            with open(self.config_path, 'w', encoding='utf-8') as f:
                yaml.dump(self.config, f, allow_unicode=True, default_flow_style=False)
            logger.info(f"✅ 配置已保存: {self.config_path}")
        except Exception as e:
            logger.error(f"❌ 保存配置失败: {e}")
            raise

    def bind_device(self, provider_name: str, device_id: str, device_name: str = None) -> Tuple[bool, str]:
        """
        绑定设备到API Key

        Args:
            provider_name: 服务商名称
            device_id: 设备指纹
            device_name: 设备名称(可选)

        Returns:
            (成功标志, 消息)
        """
        try:
            providers = self.config.get('providers', {})
            if provider_name not in providers:
                return False, f"服务商 {provider_name} 不存在"

            provider = providers[provider_name]

            # 初始化设备列表
            if 'authorized_devices' not in provider:
                provider['authorized_devices'] = []

            devices = provider['authorized_devices']

            # 检查设备是否已绑定
            for device in devices:
                if device.get('device_id') == device_id:
                    # 更新绑定时间(续期)
                    device['bound_at'] = datetime.now().isoformat()
                    device['last_used'] = datetime.now().isoformat()
                    if device_name:
                        device['device_name'] = device_name

                    self._save_config()
                    logger.info(f"🔄 设备已续期: {device_id[:8]}... ({device_name or '未命名'})")
                    return True, "设备绑定已更新"

            # 检查设备数量限制
            # 清理过期设备
            self._cleanup_expired_devices(provider_name)

            devices = provider['authorized_devices']  # 重新获取(可能已清理)

            if len(devices) >= self.MAX_DEVICES_PER_KEY:
                return False, f"已达到最大设备数量限制({self.MAX_DEVICES_PER_KEY}个),请先移除其他设备"

            # 添加新设备
            new_device = {
                'device_id': device_id,
                'device_name': device_name or f"设备 {len(devices) + 1}",
                'bound_at': datetime.now().isoformat(),
                'last_used': datetime.now().isoformat()
            }

            devices.append(new_device)
            self._save_config()

            logger.info(f"✅ 新设备已绑定: {device_id[:8]}... ({new_device['device_name']})")
            return True, "设备绑定成功"

        except Exception as e:
            logger.error(f"❌ 绑定设备失败: {e}")
            return False, f"绑定失败: {str(e)}"

    def validate_device(self, provider_name: str, device_id: str) -> Tuple[bool, str]:
        """
        验证设备是否有权限访问

        Args:
            provider_name: 服务商名称
            device_id: 设备指纹

        Returns:
            (验证通过, 消息)
        """
        try:
            providers = self.config.get('providers', {})
            if provider_name not in providers:
                return False, f"服务商 {provider_name} 不存在"

            provider = providers[provider_name]

            # 如果没有配置设备绑定,则不验证(向后兼容)
            if 'authorized_devices' not in provider or not provider['authorized_devices']:
                logger.warning(f"⚠️ 服务商 {provider_name} 未启用设备绑定")
                return True, "未启用设备验证"

            devices = provider['authorized_devices']

            # 查找设备
            for device in devices:
                if device.get('device_id') == device_id:
                    # 检查是否过期
                    bound_at_str = device.get('bound_at')
                    if not bound_at_str:
                        logger.warning(f"设备缺少绑定时间: {device_id[:8]}...")
                        continue

                    bound_at = datetime.fromisoformat(bound_at_str)
                    expiry_time = bound_at + timedelta(hours=self.BINDING_DURATION_HOURS)

                    if datetime.now() > expiry_time:
                        logger.warning(f"⏰ 设备绑定已过期: {device_id[:8]}...")
                        return False, f"设备绑定已过期(绑定时间: {bound_at_str}, 有效期: {self.BINDING_DURATION_HOURS}小时)"

                    # 更新最后使用时间
                    device['last_used'] = datetime.now().isoformat()
                    self._save_config()

                    logger.info(f"✅ 设备验证通过: {device_id[:8]}...")
                    return True, "验证通过"

            # 设备未绑定
            logger.warning(f"❌ 未授权的设备: {device_id[:8]}...")
            return False, "设备未授权,请先在设置页面绑定设备"

        except Exception as e:
            logger.error(f"❌ 验证设备失败: {e}")
            return False, f"验证失败: {str(e)}"

    def is_device_binding_valid(self, provider_name: str, device_id: str) -> bool:
        """
        检查设备绑定是否有效(不更新last_used时间,仅用于状态查询)

        Args:
            provider_name: 服务商名称
            device_id: 设备指纹

        Returns:
            绑定是否有效
        """
        try:
            providers = self.config.get('providers', {})
            if provider_name not in providers:
                return False

            provider = providers[provider_name]

            # 如果没有配置设备绑定,认为有效(向后兼容)
            if 'authorized_devices' not in provider or not provider['authorized_devices']:
                return True

            devices = provider['authorized_devices']

            # 查找设备
            for device in devices:
                if device.get('device_id') == device_id:
                    # 检查是否过期
                    bound_at_str = device.get('bound_at')
                    if not bound_at_str:
                        continue

                    bound_at = datetime.fromisoformat(bound_at_str)
                    expiry_time = bound_at + timedelta(hours=self.BINDING_DURATION_HOURS)

                    if datetime.now() > expiry_time:
                        return False

                    return True

            # 设备未绑定
            return False

        except Exception as e:
            logger.error(f"❌ 检查设备绑定有效性失败: {e}")
            return False

    def _cleanup_expired_devices(self, provider_name: str):
        """清理过期设备"""
        try:
            provider = self.config['providers'].get(provider_name)
            if not provider or 'authorized_devices' not in provider:
                return

            devices = provider['authorized_devices']
            original_count = len(devices)

            # 过滤掉过期设备
            valid_devices = []
            now = datetime.now()

            for device in devices:
                bound_at_str = device.get('bound_at')
                if not bound_at_str:
                    continue

                bound_at = datetime.fromisoformat(bound_at_str)
                expiry_time = bound_at + timedelta(hours=self.BINDING_DURATION_HOURS)

                if now <= expiry_time:
                    valid_devices.append(device)
                else:
                    logger.info(f"🗑️ 清理过期设备: {device.get('device_id', 'unknown')[:8]}... ({device.get('device_name', '未命名')})")

            provider['authorized_devices'] = valid_devices

            if len(valid_devices) < original_count:
                self._save_config()
                logger.info(f"✅ 已清理 {original_count - len(valid_devices)} 个过期设备")

        except Exception as e:
            logger.error(f"清理过期设备失败: {e}")

    def remove_device(self, provider_name: str, device_id: str) -> Tuple[bool, str]:
        """
        移除设备绑定

        Args:
            provider_name: 服务商名称
            device_id: 设备指纹

        Returns:
            (成功标志, 消息)
        """
        try:
            provider = self.config['providers'].get(provider_name)
            if not provider or 'authorized_devices' not in provider:
                return False, "未找到设备列表"

            devices = provider['authorized_devices']
            original_count = len(devices)

            # 过滤掉指定设备
            provider['authorized_devices'] = [
                d for d in devices if d.get('device_id') != device_id
            ]

            if len(provider['authorized_devices']) < original_count:
                self._save_config()
                logger.info(f"✅ 设备已移除: {device_id[:8]}...")
                return True, "设备已移除"
            else:
                return False, "设备不存在"

        except Exception as e:
            logger.error(f"移除设备失败: {e}")
            return False, f"移除失败: {str(e)}"

    def get_devices(self, provider_name: str) -> List[Dict]:
        """
        获取服务商的所有授权设备

        Args:
            provider_name: 服务商名称

        Returns:
            设备列表
        """
        try:
            provider = self.config['providers'].get(provider_name, {})
            devices = provider.get('authorized_devices', [])

            # 清理过期设备
            self._cleanup_expired_devices(provider_name)

            # 重新加载
            provider = self.config['providers'].get(provider_name, {})
            devices = provider.get('authorized_devices', [])

            return devices

        except Exception as e:
            logger.error(f"获取设备列表失败: {e}")
            return []
